import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor to attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Ensuring headers exist before setting
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/** * API Service Exports
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