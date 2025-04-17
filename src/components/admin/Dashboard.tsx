import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import { dashboardApi } from '../../services/api';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TimelineIcon from '@mui/icons-material/Timeline';
import FlagIcon from '@mui/icons-material/Flag';
import EventNoteIcon from '@mui/icons-material/EventNote';

interface DashboardStats {
  surveys: number;
  patients: number;
  recent_surveys: number;
  flagged_surveys: number;
  survey_completion_rate: number;
  survey_workflows: number;
  questions: number;
  recent_activity: {
    action: string;
    entity_type: string;
    created_at: string;
    admin_name: string;
  }[];
}

interface HipaaComplianceStats {
  audit_logs: {
    total: number;
    last_24_hours: number;
  };
  data_encryption: {
    status: string;
    encrypted_fields: number;
    total_fields: number;
  };
  access_controls: {
    total_admins: number;
    super_admins: number;
    regular_admins: number;
    recent_login_attempts: number;
    failed_login_attempts: number;
  };
  patients_by_gender?: {
    total: number;
    active: number;
    by_gender: {
      male: number;
      female: number;
      other: number;
      undisclosed: number;
    };
  };
  recent_phi_access: {
    action: string;
    entity_type: string;
    created_at: string;
    admin_name: string;
  }[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [hipaaStats, setHipaaStats] = useState<HipaaComplianceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, hipaaResponse] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getHipaaCompliance()
        ]);
        
        // Log the API responses for debugging
        console.log('Stats Response:', JSON.stringify(statsResponse.data));
        console.log('HIPAA Response:', JSON.stringify(hipaaResponse.data));
        
        setStats(statsResponse.data);
        setHipaaStats(hipaaResponse.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {/* Key Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'primary.light',
              color: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Patients
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ mr: 1, fontSize: 40 }} />
              <Typography variant="h3">{stats?.patients || 0}</Typography>
            </Box>
          </Paper>
        </Box>
        
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'secondary.light',
              color: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Surveys
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ mr: 1, fontSize: 40 }} />
              <Typography variant="h3">{stats?.surveys || 0}</Typography>
            </Box>
          </Paper>
        </Box>
        
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#ff9800',
              color: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              Flagged Surveys
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FlagIcon sx={{ mr: 1, fontSize: 40 }} />
              <Typography variant="h3">{stats?.flagged_surveys || 0}</Typography>
            </Box>
          </Paper>
        </Box>
        
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#4caf50',
              color: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              Completion Rate
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimelineIcon sx={{ mr: 1, fontSize: 40 }} />
              <Typography variant="h3">
                {stats?.survey_completion_rate ? `${stats.survey_completion_rate}%` : '0%'}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
      
      {/* HIPAA Compliance Section */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        HIPAA Compliance
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Data Encryption */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
          <Card elevation={3}>
            <CardHeader 
              title="Data Encryption" 
              avatar={<SecurityIcon color="primary" />}
              titleTypographyProps={{ variant: 'h6' }}
            />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1">
                  Status: 
                </Typography>
                <Chip 
                  label={hipaaStats?.data_encryption.status || 'Unknown'} 
                  color={hipaaStats?.data_encryption.status === 'Active' ? 'success' : 'error'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
              <Typography variant="body1" gutterBottom>
                {hipaaStats?.data_encryption.encrypted_fields || 0} of {hipaaStats?.data_encryption.total_fields || 0} fields encrypted
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                {hipaaStats?.data_encryption.status === 'Active' ? (
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                ) : (
                  <ErrorIcon color="error" sx={{ mr: 1 }} />
                )}
                <Typography variant="body2" color="text.secondary">
                  {hipaaStats?.data_encryption.status === 'Active' 
                    ? 'All PHI is properly encrypted at rest and in transit'
                    : 'Some PHI may not be properly encrypted'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        {/* Audit Logging */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
          <Card elevation={3}>
            <CardHeader 
              title="Audit Logging" 
              avatar={<EventNoteIcon color="primary" />}
              titleTypographyProps={{ variant: 'h6' }}
            />
            <Divider />
            <CardContent>
              <Typography variant="body1" gutterBottom>
                Total Audit Logs: {hipaaStats?.audit_logs.total || 0}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Logs in Last 24 Hours: {hipaaStats?.audit_logs.last_24_hours || 0}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  All PHI access is being properly logged
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        {/* Access Controls */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
          <Card elevation={3}>
            <CardHeader 
              title="Access Controls" 
              avatar={<PeopleIcon color="primary" />}
              titleTypographyProps={{ variant: 'h6' }}
            />
            <Divider />
            <CardContent>
              <Typography variant="body1" gutterBottom>
                Total Admins: {hipaaStats?.access_controls.total_admins || 0}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Super Admins: {hipaaStats?.access_controls.super_admins || 0}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Regular Admins: {hipaaStats?.access_controls.regular_admins || 0}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Failed Login Attempts: {hipaaStats?.access_controls.failed_login_attempts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        {/* Patient Demographics */}
        {hipaaStats?.patients_by_gender ? (
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
            <Card elevation={3}>
              <CardHeader 
                title="Patient Demographics" 
                avatar={<PeopleIcon color="primary" />}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <Typography variant="body1" gutterBottom>
                  Total Patients: {hipaaStats?.patients_by_gender?.total || 0}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Active Patients: {hipaaStats?.patients_by_gender?.active || 0}
                </Typography>
                <Typography variant="body1" gutterBottom fontWeight="bold" sx={{ mt: 2 }}>
                  Gender Distribution:
                </Typography>
                {hipaaStats?.patients_by_gender?.by_gender ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                    <Chip 
                      label={`Male: ${hipaaStats?.patients_by_gender?.by_gender?.male || 0}`} 
                      color="primary" 
                      variant="outlined"
                    />
                    <Chip 
                      label={`Female: ${hipaaStats?.patients_by_gender?.by_gender?.female || 0}`} 
                      color="secondary" 
                      variant="outlined"
                    />
                    <Chip 
                      label={`Other: ${hipaaStats?.patients_by_gender?.by_gender?.other || 0}`} 
                      color="info" 
                      variant="outlined"
                    />
                    <Chip 
                      label={`Undisclosed: ${hipaaStats?.patients_by_gender?.by_gender?.undisclosed || 0}`} 
                      color="default" 
                      variant="outlined"
                    />
                  </Box>
                ) : null}
              </CardContent>
            </Card>
          </Box>
        ) : null}
        
        {/* Recent PHI Access */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
          <Card elevation={3}>
            <CardHeader 
              title="Recent PHI Access" 
              avatar={<SecurityIcon color="primary" />}
              titleTypographyProps={{ variant: 'h6' }}
            />
            <Divider />
            <CardContent>
              <List dense>
                {hipaaStats?.recent_phi_access && hipaaStats.recent_phi_access.length > 0 ? (
                  hipaaStats.recent_phi_access.map((activity, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <SecurityIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${activity.action} on ${activity.entity_type}`}
                        secondary={`By ${activity.admin_name} at ${new Date(activity.created_at).toLocaleString()}`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No recent PHI access recorded" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      {/* Recent Activity */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Recent Activity
      </Typography>
      
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        <List>
          {stats?.recent_activity && stats.recent_activity.length > 0 ? (
            stats.recent_activity.map((activity, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    <EventNoteIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${activity.action} on ${activity.entity_type}`}
                    secondary={`By ${activity.admin_name} at ${new Date(activity.created_at).toLocaleString()}`}
                  />
                </ListItem>
                {index < stats.recent_activity.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No recent activity" />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default Dashboard;
