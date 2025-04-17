import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Chip
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { dashboardApi } from '../../../services/api';
import ErrorDisplay from '../../common/ErrorDisplay';

// Simple date formatting function using native JavaScript
const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

interface ComplianceData {
  total_patients: number;
  encrypted_data_percentage: number;
  audit_logs_count: number;
  recent_access_logs: Array<{
    id: number;
    admin_name: string;
    action: string;
    created_at: string;
    ip_address: string;
  }>;
  compliance_score: number;
  compliance_issues: Array<{
    issue: string;
    severity: 'high' | 'medium' | 'low';
  }>;
}

const HipaaComplianceDashboard: React.FC = () => {
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ type: 'error' | 'unauthorized' | 'forbidden', message: string } | null>(null);

  const fetchComplianceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await dashboardApi.getHipaaCompliance();
      setComplianceData(response.data);
    } catch (err: any) {
      console.error('Error fetching HIPAA compliance data:', err);
      
      // Handle different error types
      if (err.response) {
        if (err.response.status === 401) {
          setError({ type: 'unauthorized', message: 'Your session has expired. Please log in again.' });
        } else if (err.response.status === 403) {
          setError({ type: 'forbidden', message: 'You do not have permission to access this resource.' });
        } else {
          setError({ type: 'error', message: 'Error loading HIPAA compliance data. Please try again later.' });
        }
      } else {
        setError({ type: 'error', message: 'Network error. Please check your connection and try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading HIPAA compliance data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return <ErrorDisplay type={error.type} message={error.message} onRetry={fetchComplianceData} />;
  }

  if (!complianceData) {
    return <ErrorDisplay type="error" message="No compliance data available" onRetry={fetchComplianceData} />;
  }

  // Format action name for display
  const formatAction = (action: string) => {
    if (!action) return 'Unknown Action';
    
    const parts = action.split('.');
    if (parts.length !== 2) return action;
    
    const [actionType, entity] = parts;
    
    const actionMap: Record<string, string> = {
      'show': 'Viewed',
      'index': 'Listed',
      'create': 'Created',
      'update': 'Updated',
      'delete': 'Deleted',
      'export': 'Exported'
    };
    
    return `${actionMap[actionType] || actionType} ${entity}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <SecurityIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          HIPAA Compliance Dashboard
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Compliance Score */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' } }}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" gutterBottom>
              HIPAA Compliance Score
            </Typography>
            <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
              <CircularProgress 
                variant="determinate" 
                value={complianceData.compliance_score} 
                size={120} 
                thickness={5} 
                color={complianceData.compliance_score > 90 ? 'success' : complianceData.compliance_score > 70 ? 'warning' : 'error'} 
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h4" component="div" color="text.secondary">
                  {complianceData.compliance_score}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" align="center">
              {complianceData.compliance_score >= 95 
                ? 'Excellent! Your system is highly compliant with HIPAA regulations.' 
                : complianceData.compliance_score >= 80 
                ? 'Good compliance level. Some improvements needed.' 
                : 'Attention needed. Several compliance issues to address.'}
            </Typography>
          </Paper>
        </Box>

        {/* Patient Data */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' } }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Patient Data Security
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h5" component="div">
                    {complianceData.total_patients} Patients
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total patients in the system
                  </Typography>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h5" component="div">
                    {complianceData.encrypted_data_percentage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Patient data encrypted
                  </Typography>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h5" component="div">
                    {complianceData.audit_logs_count} Audit Logs
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total audit log entries
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Box>

        {/* Compliance Issues */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' } }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <VerifiedUserIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Compliance Issues
              </Typography>
            </Box>
            <List>
              {complianceData.compliance_issues.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary="No compliance issues detected" 
                    secondary="Your system is currently meeting all HIPAA requirements"
                  />
                </ListItem>
              ) : (
                complianceData.compliance_issues.map((issue, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText 
                        primary={issue.issue}
                        secondary={
                          <Chip 
                            label={issue.severity.toUpperCase()} 
                            size="small" 
                            color={issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warning' : 'info'}
                          />
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Box>

        {/* Recent Access Logs */}
        <Box sx={{ flex: '1 1 100%' }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ListAltIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Recent Access Logs
              </Typography>
            </Box>
            <List>
              {complianceData.recent_access_logs.map((log) => (
                <React.Fragment key={log.id}>
                  <ListItem>
                    <ListItemText 
                      primary={formatAction(log.action)} 
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {log.admin_name}
                          </Typography>
                          {` — ${formatDate(log.created_at)} from IP ${log.ip_address}`}
                        </>
                      } 
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default HipaaComplianceDashboard;
