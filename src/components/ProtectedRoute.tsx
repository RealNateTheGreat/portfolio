import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) {
    // Redirect to login page while saving the attempted URL
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};