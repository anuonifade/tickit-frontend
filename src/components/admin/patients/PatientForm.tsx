import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  CircularProgress,
  Alert,
  FormHelperText,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { patientApi } from '../../../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface PatientFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  medical_record_number: string;
  status: string;
}

const validationSchema = Yup.object({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone_number: Yup.string().required('Phone number is required'),
  date_of_birth: Yup.date().required('Date of birth is required'),
  gender: Yup.string().required('Gender is required'),
  medical_record_number: Yup.string().required('Medical record number is required'),
  status: Yup.string().required('Status is required')
});

const PatientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const initialValues: PatientFormValues = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    medical_record_number: '',
    status: 'active'
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        if (isEditMode) {
          await patientApi.updatePatient(parseInt(id), values);
        } else {
          await patientApi.createPatient(values);
        }
        navigate('/admin/patients');
      } catch (err: any) {
        console.error('Error saving patient:', err);
        setSubmitError(err.response?.data?.error || 'Failed to save patient');
      }
    }
  });

  useEffect(() => {
    const fetchPatient = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        const response = await patientApi.getPatient(parseInt(id));
        const patient = response.data;
        
        // Format date to YYYY-MM-DD for the date input
        const formattedDate = new Date(patient.date_of_birth)
          .toISOString()
          .split('T')[0];
        
        formik.setValues({
          first_name: patient.first_name,
          last_name: patient.last_name,
          email: patient.email,
          phone_number: patient.phone_number,
          date_of_birth: formattedDate,
          gender: patient.gender,
          medical_record_number: patient.medical_record_number,
          status: patient.status
        });
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching patient:', err);
        setError(err.response?.data?.error || 'Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, isEditMode]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/patients')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">
          {isEditMode ? 'Edit Patient' : 'Add Patient'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
              <TextField
                fullWidth
                id="first_name"
                name="first_name"
                label="First Name"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
              />
            </Box>
            
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
              <TextField
                fullWidth
                id="last_name"
                name="last_name"
                label="Last Name"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
              />
            </Box>
            
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Box>
            
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
              <TextField
                fullWidth
                id="phone_number"
                name="phone_number"
                label="Phone Number"
                value={formik.values.phone_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
                helperText={formik.touched.phone_number && formik.errors.phone_number}
              />
            </Box>
            
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
              <TextField
                fullWidth
                id="date_of_birth"
                name="date_of_birth"
                label="Date of Birth"
                type="date"
                value={formik.values.date_of_birth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.date_of_birth && Boolean(formik.errors.date_of_birth)}
                helperText={formik.touched.date_of_birth && formik.errors.date_of_birth}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
              <FormControl 
                fullWidth
                error={formik.touched.gender && Boolean(formik.errors.gender)}
              >
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formik.values.gender}
                  label="Gender"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="non-binary">Non-binary</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </Select>
                {formik.touched.gender && formik.errors.gender && (
                  <FormHelperText>{formik.errors.gender}</FormHelperText>
                )}
              </FormControl>
            </Box>
            
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
              <TextField
                fullWidth
                id="medical_record_number"
                name="medical_record_number"
                label="Medical Record Number"
                value={formik.values.medical_record_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.medical_record_number && Boolean(formik.errors.medical_record_number)}
                helperText={formik.touched.medical_record_number && formik.errors.medical_record_number}
              />
            </Box>
            
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
              <FormControl 
                fullWidth
                error={formik.touched.status && Boolean(formik.errors.status)}
              >
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  label="Status"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Box>
            
            <Box sx={{ flex: '1 1 100%' }}>
              {submitError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {submitError}
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/patients')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? (
                    <CircularProgress size={24} />
                  ) : (
                    isEditMode ? 'Update Patient' : 'Create Patient'
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default PatientForm;
