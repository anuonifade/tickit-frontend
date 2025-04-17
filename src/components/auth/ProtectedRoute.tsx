import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ErrorDisplay from '../common/ErrorDisplay';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
}

/**
 * A component that protects routes requiring authentication
 * Redirects to login if not authenticated
 * Shows access denied if authenticated but lacking required role
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, admin, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state if auth is still being checked
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Authenticating...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If role is required and user doesn't have it, show forbidden error
  if (requiredRole && admin?.role !== requiredRole) {
    return (
      <ErrorDisplay 
        type="forbidden" 
        message={`This page requires ${requiredRole} privileges.`}
      />
    );
  }

  // User is authenticated and has required role (if any)
  return <>{children}</>;
};

export default ProtectedRoute;
