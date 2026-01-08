import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateGoal from './pages/CreateGoal';
import GoalDetails from './pages/GoalDetails';
import ProfileSetup from './pages/ProfileSetup';
import LifeGoals from './pages/LifeGoals';
import AskPathfinder from './pages/AskPathfinder';

/**
 * ProtectedRoute Component
 * Gatekeeps access to routes based on the presence of a JWT token.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Redirect to login and replace the current history entry
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const token = localStorage.getItem('token');
  return (
    <Router>
      {/* Show Navbar only if logged in */}
      {token && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes - Wrapped in ProtectedRoute for security */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/create-goal"
          element={<ProtectedRoute><CreateGoal /></ProtectedRoute>}
        />
        <Route
          path="/goal/:id"
          element={<ProtectedRoute><GoalDetails /></ProtectedRoute>}
        />
        <Route
          path="/profile-setup"
          element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>}
        />
        <Route
          path="/life-goals"
          element={<ProtectedRoute><LifeGoals /></ProtectedRoute>}
        />

        <Route path="/ask-pathfinder" element={
          <ProtectedRoute>
            <AskPathfinder />
          </ProtectedRoute>
        } />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;