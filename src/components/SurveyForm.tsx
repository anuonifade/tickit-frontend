import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Snackbar, 
  Alert, 
  CircularProgress,
  Rating
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

// Define the API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// Define the survey form validation schema
const validationSchema = Yup.object({
  feeling: Yup.number()
    .required('Please rate how you are feeling')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  stress_level: Yup.number()
    .required('Please rate your stress level')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  sleep_hours: Yup.number()
    .required('Please indicate your sleep hours')
    .min(0, 'Sleep hours must be a positive number')
    .max(24, 'Sleep hours must be less than 24'),
  symptoms: Yup.string()
    .required('Please describe your symptoms')
    .min(3, 'Symptoms description must be at least 3 characters')
});

// Survey form component
const SurveyForm: React.FC = () => {
  // State for submission status and notifications
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize formik for form handling
  const formik = useFormik({
    initialValues: {
      feeling: 0,
      stress_level: 0,
      sleep_hours: 7,
      symptoms: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        setSubmitError(null);
        
        // Ensure all numeric fields are submitted as numbers
        const surveyData = {
          ...values,
          feeling: Number(values.feeling),
          stress_level: Number(values.stress_level),
          sleep_hours: Number(values.sleep_hours)
        };
        
        // Submit survey data to API
        const response = await axios.post(`${API_URL}/surveys`, { survey: surveyData });
        
        // Handle successful submission
        setSubmitSuccess(true);
        formik.resetForm();
        console.log('Survey submitted successfully:', response.data);
      } catch (error) {
        // Handle submission error
        console.error('Error submitting survey:', error);
        if (axios.isAxiosError(error) && error.response) {
          setSubmitError(error.response.data.error || 'Failed to submit survey. Please try again.');
        } else {
          setSubmitError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // Handle closing the success notification
  const handleCloseSuccess = () => {
    setSubmitSuccess(false);
  };

  // Handle closing the error notification
  const handleCloseError = () => {
    setSubmitError(null);
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Mental Health Survey
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom align="center" sx={{ mb: 4 }}>
          Your responses are encrypted and kept confidential in accordance with HIPAA regulations.
        </Typography>
        
        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          {/* Feeling Rating Question */}
          <FormControl fullWidth margin="normal">
            <FormLabel id="feeling-label">How are you feeling today?</FormLabel>
            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>Poor</Typography>
              <Rating
                name="feeling"
                value={formik.values.feeling}
                onChange={(event, newValue) => {
                  formik.setFieldValue('feeling', newValue);
                }}
                max={5}
                size="large"
              />
              <Typography variant="body2" sx={{ ml: 1 }}>Excellent</Typography>
            </Box>
            {formik.touched.feeling && formik.errors.feeling && (
              <Typography color="error" variant="caption">
                {formik.errors.feeling}
              </Typography>
            )}
          </FormControl>

          {/* Stress Level Question */}
          <FormControl fullWidth margin="normal">
            <FormLabel id="stress-level-label">Rate your stress level from 1-5</FormLabel>
            <RadioGroup
              row
              aria-labelledby="stress-level-label"
              name="stress_level"
              value={formik.values.stress_level}
              onChange={formik.handleChange}
            >
              <FormControlLabel value={1} control={<Radio />} label="1 (Very Low)" />
              <FormControlLabel value={2} control={<Radio />} label="2 (Low)" />
              <FormControlLabel value={3} control={<Radio />} label="3 (Moderate)" />
              <FormControlLabel value={4} control={<Radio />} label="4 (High)" />
              <FormControlLabel value={5} control={<Radio />} label="5 (Very High)" />
            </RadioGroup>
            {formik.touched.stress_level && formik.errors.stress_level && (
              <Typography color="error" variant="caption">
                {formik.errors.stress_level}
              </Typography>
            )}
          </FormControl>

          {/* Sleep Hours Question */}
          <FormControl fullWidth margin="normal">
            <FormLabel id="sleep-hours-label">How many hours did you sleep last night?</FormLabel>
            <TextField
              id="sleep_hours"
              name="sleep_hours"
              type="number"
              inputProps={{ min: 0, max: 24, step: 0.5 }}
              value={formik.values.sleep_hours}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.sleep_hours && Boolean(formik.errors.sleep_hours)}
              helperText={formik.touched.sleep_hours && formik.errors.sleep_hours}
              fullWidth
              margin="dense"
            />
          </FormControl>

          {/* Symptoms Question */}
          <FormControl fullWidth margin="normal">
            <TextField
              id="symptoms"
              name="symptoms"
              label="Please describe any symptoms you're experiencing"
              multiline
              rows={4}
              value={formik.values.symptoms}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.symptoms && Boolean(formik.errors.symptoms)}
              helperText={formik.touched.symptoms && formik.errors.symptoms}
              fullWidth
            />
          </FormControl>

          {/* Privacy Notice */}
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Your privacy is important to us. All data is encrypted and stored securely in compliance with HIPAA regulations.
              We only collect the information necessary to provide you with appropriate mental health support.
            </Typography>
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isSubmitting}
            sx={{ mt: 2, py: 1.5 }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Submit Survey'}
          </Button>
        </Box>
      </Paper>

      {/* Success Message */}
      <Snackbar open={submitSuccess} autoHideDuration={6000} onClose={handleCloseSuccess}>
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          Thank you! Your survey has been submitted successfully.
        </Alert>
      </Snackbar>

      {/* Error Message */}
      <Snackbar open={!!submitError} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {submitError}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SurveyForm;
