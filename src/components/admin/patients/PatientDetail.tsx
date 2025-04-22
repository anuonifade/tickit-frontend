import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { patientApi } from '../../../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import FlagIcon from '@mui/icons-material/Flag';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  medical_record_number: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Survey {
  id: number;
  feeling: number;
  stress_level: number;
  sleep_hours: number;
  symptoms: string;
  created_at: string;
  flagged: boolean;
  flagged_reason?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const [patientResponse, surveysResponse] = await Promise.all([
          patientApi.getPatient(parseInt(id!)),
          patientApi.getPatientSurveys(parseInt(id!))
        ]);
        
        // Log the response for debugging
        console.log('Patient data:', patientResponse.data);
        console.log('Surveys data:', surveysResponse.data);
        
        // Check if we received valid patient data
        if (patientResponse.data) {
          setPatient(patientResponse.data);
        } else {
          // Create a placeholder patient with default values
          setPatient({
            id: parseInt(id!),
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
            date_of_birth: '',
            gender: '',
            medical_record_number: '',
            status: 'unknown',
            created_at: '',
            updated_at: ''
          });
        }
        
        // Set surveys if available, otherwise empty array
        setSurveys(surveysResponse.data?.surveys || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching patient data:', err);
        setError(err.response?.data?.error || 'Failed to load patient data');
        
        // Create a placeholder patient even on error
        setPatient({
          id: parseInt(id!),
          first_name: '',
          last_name: '',
          email: '',
          phone_number: '',
          date_of_birth: '',
          gender: '',
          medical_record_number: '',
          status: 'unknown',
          created_at: '',
          updated_at: ''
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'archived':
        return 'error';
      default:
        return 'default';
    }
  };

  // Helper function to determine if a field is encrypted or missing
  const formatPhiField = (value: string | null | undefined, isEncrypted: boolean = false) => {
    if (isEncrypted) return '*****'; // Placeholder for encrypted PHI
    if (!value) return 'N/A'; // Placeholder for missing data
    return value;
  };
  
  // Format date fields with encryption handling
  const formatDate = (dateString: string | null | undefined, isEncrypted: boolean = false) => {
    if (isEncrypted) return '*****';
    if (!dateString) return 'N/A';
    
    // Try to parse the date
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString();
  };

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

  if (!patient) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Patient not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/patients')}
          variant="outlined"
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        
        <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
          Patient Details
        </Typography>
        
        <Button
          startIcon={<EditIcon />}
          variant="contained"
          color="primary"
          component={Link}
          to={`/admin/patients/${id}/edit`}
        >
          Edit Patient
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="patient tabs">
            <Tab label="Profile" id="patient-tab-0" aria-controls="patient-tabpanel-0" />
            <Tab 
              label="Survey History" 
              id="patient-tab-1" 
              aria-controls="patient-tabpanel-1" 
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Personal Information</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Full Name" 
                      secondary={patient.first_name ? `${formatPhiField(patient.first_name, true)} ${formatPhiField(patient.last_name, true)}` : '*****'} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email" 
                      secondary={formatPhiField(patient.email, true)} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Phone" 
                      secondary={formatPhiField(patient.phone_number, true)} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <EventIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Date of Birth" 
                      secondary={formatDate(patient.date_of_birth, true)} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Gender" 
                      secondary={formatPhiField(patient.gender)} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <EventIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Created" 
                      secondary={formatDate(patient.created_at)} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <EventIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Last Updated" 
                      secondary={formatDate(patient.updated_at)} 
                    />
                  </ListItem>
                </List>
              </Paper>
            </Box>
            
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MedicalInformationIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Medical Information</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <MedicalInformationIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Medical Record Number" 
                      secondary={formatPhiField(patient.medical_record_number, true)} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Status" 
                      secondary={
                        <Chip 
                          label={patient.status} 
                          size="small" 
                          color={getStatusChipColor(patient.status)} 
                        />
                      } 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Survey Count" 
                      secondary={surveys.length} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Last Survey" 
                      secondary={
                        surveys.length > 0 
                          ? new Date(surveys[0].created_at).toLocaleString()
                          : 'No surveys yet'
                      } 
                    />
                  </ListItem>
                </List>
              </Paper>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {surveys.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
              No surveys found for this patient
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {surveys.map((survey) => (
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }} key={survey.id}>
                  <Paper elevation={2} sx={{ p: 3, position: 'relative' }}>
                    {survey.flagged && (
                      <Chip
                        icon={<FlagIcon />}
                        label="Flagged"
                        color="error"
                        size="small"
                        sx={{ position: 'absolute', top: 10, right: 10 }}
                      />
                    )}
                    
                    <Typography variant="h6" gutterBottom>
                      Survey #{survey.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Submitted on {new Date(survey.created_at).toLocaleString()}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                        <Typography variant="body2" color="text.secondary">
                          Feeling Rating
                        </Typography>
                        <Typography variant="body1">
                          {survey.feeling}/5
                        </Typography>
                      </Box>
                      
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                        <Typography variant="body2" color="text.secondary">
                          Stress Level
                        </Typography>
                        <Typography variant="body1">
                          {survey.stress_level}/5
                        </Typography>
                      </Box>
                      
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                        <Typography variant="body2" color="text.secondary">
                          Sleep Hours
                        </Typography>
                        <Typography variant="body1">
                          {survey.sleep_hours} hours
                        </Typography>
                      </Box>
                      
                      <Box sx={{ flex: '1 1 100%' }}>
                        <Typography variant="body2" color="text.secondary">
                          Symptoms
                        </Typography>
                        <Typography variant="body1">
                          {survey.symptoms}
                        </Typography>
                      </Box>
                      
                      {survey.flagged && survey.flagged_reason && (
                        <Box sx={{ flex: '1 1 100%' }}>
                          <Typography variant="body2" color="error">
                            Flag Reason: {survey.flagged_reason}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        component={Link}
                        to={`/admin/survey-responses/${survey.id}`}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              ))}
            </Box>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PatientDetail;
