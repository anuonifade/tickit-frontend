import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'super_admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { isAuthenticated, isLoading, admin } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user has required role (if specified)
  if (requiredRole && admin?.role !== requiredRole) {
    // For super_admin role check
    if (requiredRole === 'super_admin' && admin?.role !== 'super_admin') {
      return <Navigate to="/admin/unauthorized" replace />;
    }
  }

  // User is authenticated and has required role, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
