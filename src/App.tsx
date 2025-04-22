import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import SurveyForm from './components/SurveyForm';
import SurveyAnalytics from './components/SurveyAnalytics';

// Admin components
import Login from './components/admin/Login';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import PatientList from './components/admin/patients/PatientList';
import PatientDetail from './components/admin/patients/PatientDetail';
import PatientForm from './components/admin/patients/PatientForm';
import SurveyResponseList from './components/admin/surveys/SurveyResponseList';
import SurveyResponseDetail from './components/admin/surveys/SurveyResponseDetail';
import AuditLogList from './components/admin/audit/AuditLogList';
import AnalyticsDashboard from './components/admin/analytics/AnalyticsDashboard';
import HipaaComplianceDashboard from './components/admin/dashboard/HipaaComplianceDashboard';
import Unauthorized from './components/admin/Unauthorized';
import ErrorDisplay from './components/common/ErrorDisplay';

// Auth components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Question management components
import QuestionList from './components/admin/questions/QuestionList';
import QuestionForm from './components/admin/questions/QuestionForm';
import QuestionTemplateList from './components/admin/questions/QuestionTemplateList';
import QuestionTemplateForm from './components/admin/questions/QuestionTemplateForm';

// Workflow components
import WorkflowList from './components/admin/workflows/WorkflowList';

// Context providers
import { AuthProvider } from './contexts/AuthContext';

// Create a theme with HIPAA-friendly colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue - trustworthy and calming
    },
    secondary: {
      main: '#388e3c', // Green - health and wellness
    },
    background: {
      default: '#f5f5f5', // Light grey background for better readability
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

// Public layout with navigation
const PublicLayout = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Tickit Health Survey
          </Typography>
          <Button color="inherit" component={Link} to="/admin">
            Admin
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route index element={<SurveyForm />} />
          <Route path="analytics" element={<SurveyAnalytics />} />
        </Routes>
      </Container>
      
      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Tickit Health - HIPAA Compliant Mental Health Surveys
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            All data is encrypted and stored securely in compliance with HIPAA regulations.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/unauthorized" element={<ErrorDisplay type="forbidden" />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              
              {/* Routes for all admins */}
              <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="patients" element={<ProtectedRoute><PatientList /></ProtectedRoute>} />
              <Route path="patients/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
              <Route path="patients/new" element={<ProtectedRoute><PatientForm /></ProtectedRoute>} />
              <Route path="patients/:id/edit" element={<ProtectedRoute><PatientForm /></ProtectedRoute>} />
              <Route path="survey-responses" element={<ProtectedRoute><SurveyResponseList /></ProtectedRoute>} />
              <Route path="survey-responses/:id" element={<ProtectedRoute><SurveyResponseDetail /></ProtectedRoute>} />
              <Route path="questions" element={<ProtectedRoute><QuestionList /></ProtectedRoute>} />
              <Route path="questions/new" element={<ProtectedRoute><QuestionForm /></ProtectedRoute>} />
              <Route path="questions/:id/edit" element={<ProtectedRoute><QuestionForm /></ProtectedRoute>} />
              <Route path="question-templates" element={<ProtectedRoute><QuestionTemplateList /></ProtectedRoute>} />
              <Route path="question-templates/new" element={<ProtectedRoute><QuestionTemplateForm /></ProtectedRoute>} />
              <Route path="question-templates/:id/edit" element={<ProtectedRoute><QuestionTemplateForm /></ProtectedRoute>} />
              <Route path="workflows" element={<ProtectedRoute><WorkflowList /></ProtectedRoute>} />
              <Route path="analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><div>Profile Page</div></ProtectedRoute>} />
              
              {/* Routes for super admins only */}
              <Route path="audit-logs" element={<ProtectedRoute requiredRole="super_admin"><AuditLogList /></ProtectedRoute>} />
              <Route path="hipaa-compliance" element={<ProtectedRoute requiredRole="super_admin"><HipaaComplianceDashboard /></ProtectedRoute>} />
              <Route path="admins" element={<ProtectedRoute requiredRole="super_admin"><div>Admin Management</div></ProtectedRoute>} />
            </Route>
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
