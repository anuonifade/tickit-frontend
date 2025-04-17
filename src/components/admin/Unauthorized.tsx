import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 200px)',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 500,
        }}
      >
        <SecurityIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" align="center" paragraph>
          You do not have permission to access this page. This action has been logged for security purposes in compliance with HIPAA regulations.
        </Typography>
        <Typography variant="body2" align="center" paragraph color="text.secondary">
          If you believe this is an error, please contact your system administrator.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/admin/dashboard')}
          sx={{ mt: 2 }}
        >
          Return to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default Unauthorized;
