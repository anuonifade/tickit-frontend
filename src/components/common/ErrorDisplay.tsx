import React from 'react';
import { Box, Typography, Paper, Button, Alert, AlertTitle } from '@mui/material';
import { Link } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

interface ErrorDisplayProps {
  type: 'unauthorized' | 'forbidden' | 'error';
  message?: string;
  onRetry?: () => void;
}

/**
 * A component to display different types of errors in a consistent way
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ type, message, onRetry }) => {
  const getErrorContent = () => {
    switch (type) {
      case 'unauthorized':
        return {
          title: 'Authentication Required',
          icon: <LockIcon sx={{ fontSize: 60, color: 'error.main' }} />,
          description: message || 'You need to be logged in to access this resource.',
          action: (
            <Button 
              component={Link} 
              to="/admin/login" 
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
          )
        };
      
      case 'forbidden':
        return {
          title: 'Access Denied',
          icon: <WarningIcon sx={{ fontSize: 60, color: 'warning.main' }} />,
          description: message || 'You do not have permission to access this resource.',
          action: (
            <Button 
              component={Link} 
              to="/admin/dashboard" 
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
            >
              Return to Dashboard
            </Button>
          )
        };
      
      case 'error':
      default:
        return {
          title: 'An Error Occurred',
          icon: <ErrorIcon sx={{ fontSize: 60, color: 'error.main' }} />,
          description: message || 'There was an error processing your request.',
          action: onRetry ? (
            <Button 
              onClick={onRetry} 
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          ) : null
        };
    }
  };

  const { title, icon, description, action } = getErrorContent();

  return (
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
        <Box sx={{ mb: 2 }}>
          {icon}
        </Box>
        
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
        
        <Alert severity={type === 'forbidden' ? 'warning' : 'error'} sx={{ mb: 3 }}>
          <AlertTitle>{title}</AlertTitle>
          {description}
        </Alert>
        
        {action}
      </Paper>
    </Box>
  );
};

export default ErrorDisplay;
