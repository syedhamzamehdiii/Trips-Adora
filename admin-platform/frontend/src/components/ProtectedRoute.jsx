import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children }) => {
  // Check for both admin and sub-admin authentication
  const adminToken = authService.isAuthenticated();
  const subAdminToken = localStorage.getItem('sub_admin_token');
  const isAuthenticated = adminToken || subAdminToken;

  if (!isAuthenticated) {
    // Redirect to appropriate login page
    if (subAdminToken) {
      return <Navigate to="/sub-admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

