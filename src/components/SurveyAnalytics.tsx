import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  Divider
} from '@mui/material';
import axios from 'axios';

// Define the API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// Define the analytics data interface
interface AnalyticsData {
  average_feeling: number;
  average_stress_level: number;
  average_sleep_hours: number;
  count: number;
}

// Survey analytics component
const SurveyAnalytics: React.FC = () => {
  // State for analytics data and loading status
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data on component mount
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch analytics data from API
        const response = await axios.get(`${API_URL}/surveys/analytics`);
        setAnalyticsData(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        if (axios.isAxiosError(error) && error.response) {
          setError(error.response.data.error || 'Failed to fetch analytics data.');
        } else {
          setError('An unexpected error occurred while fetching analytics data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Helper function to get a description based on feeling rating
  const getRatingDescription = (rating: number): string => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Fair';
    if (rating >= 1.5) return 'Poor';
    return 'Very Poor';
  };

  // Helper function to get a description based on stress level
  const getStressDescription = (level: number): string => {
    if (level >= 4.5) return 'Very High';
    if (level >= 3.5) return 'High';
    if (level >= 2.5) return 'Moderate';
    if (level >= 1.5) return 'Low';
    return 'Very Low';
  };

  // Helper function to get a description based on sleep hours
  const getSleepQualityDescription = (hours: number): string => {
    if (hours >= 8) return 'Optimal sleep duration';
    if (hours >= 7) return 'Good sleep duration';
    if (hours >= 6) return 'Slightly below recommended';
    if (hours >= 5) return 'Insufficient sleep';
    return 'Severely sleep deprived';
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Mental Health Survey Analytics
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom align="center" sx={{ mb: 4 }}>
          Aggregated and anonymized data from all survey responses
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : analyticsData ? (
          <React.Fragment>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Based on {analyticsData.count} {analyticsData.count === 1 ? 'response' : 'responses'}
            </Typography>
            
            <Box sx={{ mt: 1 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* Average Feeling Card */}
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Average Feeling Rating
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                      {analyticsData.average_feeling.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overall feeling: {getRatingDescription(analyticsData.average_feeling)}
                    </Typography>
                  </CardContent>
                </Card>
                
                {/* Average Stress Level Card */}
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Average Stress Level
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                      {analyticsData.average_stress_level.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overall stress: {getStressDescription(analyticsData.average_stress_level)}
                    </Typography>
                  </CardContent>
                </Card>
                
                {/* Average Sleep Hours Card */}
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Average Sleep Hours
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                      {analyticsData.average_sleep_hours.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getSleepQualityDescription(analyticsData.average_sleep_hours)}
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
              
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Note: All data is aggregated and anonymized in compliance with HIPAA regulations.
                  No personally identifiable information is included in these analytics.
                </Typography>
              </Box>
            </Box>
          </React.Fragment>
        ) : (
          <Alert severity="info" sx={{ my: 2 }}>
            No survey data available yet.
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default SurveyAnalytics;
