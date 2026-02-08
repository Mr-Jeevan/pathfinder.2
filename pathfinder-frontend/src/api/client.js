import axios from 'axios';

const RENDER_BASE_URL = 'https://pathfinder-bkend.onrender.com/api'; // Primary - your new Render link
const LOCAL_BASE_URL = 'http://localhost:5000/api'; // Fallback - localhost

// Primary client starts with Render as primary
let client = axios.create({ baseURL: RENDER_BASE_URL });

// Track current base URL index (0: Render primary, 1: local fallback)
let currentBaseIndex = 0;
const baseUrls = [RENDER_BASE_URL, LOCAL_BASE_URL];

// Interceptor to attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for automatic failover
client.interceptors.response.use(
  (response) => response, // Success: pass through
  async (error) => {
    // If current server fails (e.g., network error, 5xx), switch to fallback
    if (error.code === 'ERR_NETWORK' || (error.response && error.response.status >= 500)) {
      currentBaseIndex = (currentBaseIndex + 1) % baseUrls.length; // Toggle to next
      client.defaults.baseURL = baseUrls[currentBaseIndex];
      
      // Retry the original request with new baseURL
      error.config._retryCount = (error.config._retryCount || 0) + 1;
      if (error.config._retryCount < 2) { // Max 1 retry
        console.log(`Switching to ${client.defaults.baseURL} and retrying...`);
        return client(error.config);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * API Service Exports
 * Using these named exports ensures you are using the 'client' instance
 */

// Roadmaps (Tactical Goals)
export const deleteGoal = (id) => client.delete(`/goals/${id}`);
export const updateGoalStatus = (id, status) => client.patch(`/goals/${id}/status`, { status });

// Phase 1: Life Goals & Profile
export const createLifeGoal = (data) => client.post('/life-goals', data);
export const deleteLifeGoal = (id) => client.delete(`/life-goals/${id}`);
export const updateProfile = (data) => client.post('/profile', data);

// Phase 2: Recommendations
export const getAiRecommendations = () => client.get('/path/recommend');

export default client;

