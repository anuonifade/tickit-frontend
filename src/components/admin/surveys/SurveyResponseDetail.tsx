import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { surveyResponseApi } from '../../../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlagIcon from '@mui/icons-material/Flag';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import NoteIcon from '@mui/icons-material/Note';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../../contexts/AuthContext';

interface ResponseData {
  id: number;
  question_id: number;
  question_content: string;
  question_type: string;
  numeric_value: number | null;
  text_value: string | null;
  formatted_value: string;
}

interface SurveyResponse {
  id: number;
  patient_id: number;
  patient_name: string;
  workflow_name: string;
  created_at: string;
  updated_at: string;
  flagged: boolean;
  flagged_reason: string | null;
  flagged_at: string | null;
  flagged_by: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  response_data: ResponseData[];
  notes: SurveyNote[];
}

interface SurveyNote {
  id: number;
  content: string;
  created_at: string;
  admin: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

const SurveyResponseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [survey, setSurvey] = useState<SurveyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [unflagDialogOpen, setUnflagDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      console.log('Fetching survey with ID:', id);
      const response = await surveyResponseApi.getSurvey(parseInt(id!));
      console.log('Full API response:', response);
      
      // Handle the nested JSON structure from the API
      let surveyData;
      
      if (response.data && response.data.data && response.data.data.attributes) {
        // Extract the survey data from the nested structure
        const attributes = response.data.data.attributes;
        console.log('Survey attributes:', attributes);
        
        // Construct a survey object that matches our interface
        surveyData = {
          id: attributes.id,
          patient_id: 0, // Default value
          patient_name: attributes.patient_name || 'Anonymous',
          workflow_name: attributes.workflow_name || 'Unknown Workflow',
          created_at: attributes.created_at,
          updated_at: attributes.updated_at,
          flagged: attributes.flagged || false,
          flagged_reason: attributes.flagged_reason,
          flagged_at: null,
          flagged_by: null,
          response_data: attributes.response_data || [],
          notes: []
        };
        
        console.log('Constructed survey data:', surveyData);
      } else {
        // Fallback to the original response format if the nested structure isn't found
        surveyData = response.data;
        
        // Make sure response_data exists and is an array
        if (!surveyData.response_data || !Array.isArray(surveyData.response_data)) {
          console.warn('Response data is missing or not an array:', surveyData);
          surveyData.response_data = [];
        }
      }
      
      setSurvey(surveyData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching survey:', err);
      setError(err.response?.data?.error || 'Failed to load survey data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSurvey();
    }
  }, [id]);

  // Flag dialog form
  const flagFormik = useFormik({
    initialValues: {
      reason: '',
    },
    validationSchema: Yup.object({
      reason: Yup.string().required('Please provide a reason for flagging this survey'),
    }),
    onSubmit: async (values) => {
      try {
        setActionLoading(true);
        setActionError(null);
        await surveyResponseApi.flagSurvey(parseInt(id!), values.reason);
        setFlagDialogOpen(false);
        setActionSuccess('Survey has been flagged successfully');
        fetchSurvey();
      } catch (err: any) {
        console.error('Error flagging survey:', err);
        setActionError(err.response?.data?.error || 'Failed to flag survey');
      } finally {
        setActionLoading(false);
      }
    },
  });

  // Note dialog form
  const noteFormik = useFormik({
    initialValues: {
      content: '',
    },
    validationSchema: Yup.object({
      content: Yup.string().required('Note content is required'),
    }),
    onSubmit: async (values) => {
      try {
        setActionLoading(true);
        setActionError(null);
        await surveyResponseApi.addNote(parseInt(id!), values.content);
        setNoteDialogOpen(false);
        setActionSuccess('Note has been added successfully');
        noteFormik.resetForm();
        fetchSurvey();
      } catch (err: any) {
        console.error('Error adding note:', err);
        setActionError(err.response?.data?.error || 'Failed to add note');
      } finally {
        setActionLoading(false);
      }
    },
  });

  const handleUnflag = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      await surveyResponseApi.unflagSurvey(parseInt(id!));
      setUnflagDialogOpen(false);
      setActionSuccess('Survey has been unflagged successfully');
      fetchSurvey();
    } catch (err: any) {
      console.error('Error unflagging survey:', err);
      setActionError(err.response?.data?.error || 'Failed to unflag survey');
    } finally {
      setActionLoading(false);
    }
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

  if (!survey) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Survey response not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/survey-responses')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Survey Response #{survey.id}
        </Typography>
        {survey.flagged ? (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FlagIcon />}
            onClick={() => setUnflagDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Unflag
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            startIcon={<FlagIcon />}
            onClick={() => setFlagDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Flag
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          startIcon={<NoteAddIcon />}
          onClick={() => setNoteDialogOpen(true)}
        >
          Add Note
        </Button>
      </Box>

      {actionSuccess && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setActionSuccess(null)}>
          {actionSuccess}
        </Alert>
      )}

      {actionError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Survey Information */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Survey Information</Typography>
              {survey.flagged && (
                <Chip
                  icon={<FlagIcon />}
                  label="Flagged"
                  color="error"
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1" fontWeight="bold">
                    Patient:
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4 }}>
                  <Link to={`/admin/patients/${survey.patient_id}`}>
                    {survey.patient_name}
                  </Link>
                </Typography>
              </Box>
              
              <Box sx={{ flex: '1 1 100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1" fontWeight="bold">
                    Submitted:
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4 }}>
                  {new Date(survey.created_at).toLocaleString()}
                </Typography>
              </Box>
              
              {survey.flagged && (
                <>
                  <Box sx={{ flex: '1 1 100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <FlagIcon sx={{ mr: 1, color: 'error.main' }} />
                      <Typography variant="body1" fontWeight="bold" color="error">
                        Flag Reason:
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ ml: 4 }} color="error.dark">
                      {survey.flagged_reason}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ flex: '1 1 100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AdminPanelSettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1" fontWeight="bold">
                        Flagged By:
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ ml: 4 }}>
                      {survey.flagged_by ? 
                        `${survey.flagged_by.first_name} ${survey.flagged_by.last_name} (${survey.flagged_by.email})` : 
                        'Unknown'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ flex: '1 1 100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1" fontWeight="bold">
                        Flagged At:
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ ml: 4 }}>
                      {survey.flagged_at ? new Date(survey.flagged_at).toLocaleString() : 'Unknown'}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Box>
        
        {/* Survey Responses */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Survey Responses
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Workflow: {survey.workflow_name}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {/* Add debugging information */}
            <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Response data count: {survey.response_data ? survey.response_data.length : 0}
              </Typography>
            </Box>
            
            {survey.response_data && survey.response_data.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {survey.response_data.map((response, index) => {
                  // Determine the appropriate icon based on question type
                  let icon = <NoteIcon color="primary" />;
                  if (response.question_type === 'numeric_scale') {
                    icon = <SentimentVerySatisfiedIcon color="primary" />;
                  } else if (response.question_type === 'sleep_hours') {
                    icon = <BedtimeIcon color="primary" />;
                  } else if (response.question_type === 'stress_level') {
                    icon = <SentimentVeryDissatisfiedIcon color="primary" />;
                  }
                  
                  return (
                    <Box key={response.id || `response-${index}`} sx={{ flex: { xs: '1 1 100%', sm: response.question_type === 'text' ? '1 1 100%' : '1 1 48%' } }}>
                      <Card variant="outlined">
                        <CardHeader 
                          title={response.question_content || `Question ${index + 1}`} 
                          titleTypographyProps={{ variant: 'subtitle1' }}
                          avatar={icon}
                        />
                        <CardContent>
                          {response.question_type === 'numeric_scale' ? (
                            <Typography variant="h4" align="center">
                              {response.numeric_value || 0}/5
                            </Typography>
                          ) : response.question_type === 'text' ? (
                            <Typography variant="body1">
                              {response.text_value || 'No response provided'}
                            </Typography>
                          ) : (
                            <Typography variant="h4" align="center">
                              {response.formatted_value || 'No formatted value'}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                No response data available
              </Typography>
            )}
          </Paper>
        </Box>
        
        {/* Clinical Notes */}
        <Box sx={{ flex: '1 1 100%' }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Clinical Notes</Typography>
              <Button
                startIcon={<NoteAddIcon />}
                variant="outlined"
                onClick={() => setNoteDialogOpen(true)}
              >
                Add Note
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {survey.notes && survey.notes.length > 0 ? (
              <List>
                {survey.notes.map((note) => (
                  <React.Fragment key={note.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon>
                        <NoteIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1">
                              {note.admin.first_name} {note.admin.last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(note.created_at).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body1"
                            sx={{ display: 'inline', mt: 1 }}
                            component="span"
                          >
                            {note.content}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                No clinical notes have been added yet
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Flag Dialog */}
      <Dialog open={flagDialogOpen} onClose={() => setFlagDialogOpen(false)}>
        <form onSubmit={flagFormik.handleSubmit}>
          <DialogTitle>Flag Survey for Review</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please provide a reason for flagging this survey. This will mark it for clinical review.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="reason"
              name="reason"
              label="Flag Reason"
              fullWidth
              multiline
              rows={4}
              value={flagFormik.values.reason}
              onChange={flagFormik.handleChange}
              onBlur={flagFormik.handleBlur}
              error={flagFormik.touched.reason && Boolean(flagFormik.errors.reason)}
              helperText={flagFormik.touched.reason && flagFormik.errors.reason}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFlagDialogOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="error"
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={24} /> : 'Flag Survey'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Unflag Dialog */}
      <Dialog open={unflagDialogOpen} onClose={() => setUnflagDialogOpen(false)}>
        <DialogTitle>Remove Flag</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove the flag from this survey? This will indicate that the clinical review is complete.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnflagDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUnflag} 
            variant="contained" 
            color="primary"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Remove Flag'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)}>
        <form onSubmit={noteFormik.handleSubmit}>
          <DialogTitle>Add Clinical Note</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Add a clinical note to this survey. This note will be encrypted and only accessible to authorized personnel.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="content"
              name="content"
              label="Note Content"
              fullWidth
              multiline
              rows={4}
              value={noteFormik.values.content}
              onChange={noteFormik.handleChange}
              onBlur={noteFormik.handleBlur}
              error={noteFormik.touched.content && Boolean(noteFormik.errors.content)}
              helperText={noteFormik.touched.content && noteFormik.errors.content}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={24} /> : 'Add Note'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default SurveyResponseDetail;
