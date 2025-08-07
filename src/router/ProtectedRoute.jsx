import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('authToken');
  const { user, loading } = useAuth();

  // ⏳ Wait for user data to load on refresh
  if (loading) return <div>Loading...</div>; // You can replace this with a spinner

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }


  return <Outlet />;
};

export default ProtectedRoute;
