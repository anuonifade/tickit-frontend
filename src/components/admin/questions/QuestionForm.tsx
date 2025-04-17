import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Grid,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { questionApi } from '../../../services/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface Option {
  id: string;
  value: string;
}

interface QuestionFormData {
  text: string;
  response_type: string;
  options: Option[];
  min_value?: number | '';
  max_value?: number | '';
}

const QuestionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const isEditMode = !!id;

  const validationSchema = Yup.object({
    text: Yup.string().required('Question text is required'),
    response_type: Yup.string().required('Response type is required'),
    options: Yup.array().test({
      name: 'options-required-for-select',
      test: function(value, context) {
        const { response_type } = context.parent;
        if (['select', 'multiselect'].includes(response_type)) {
          return (
            Array.isArray(value) && 
            value.length > 0 && 
            value.every(option => option.id && option.value)
          ) || this.createError({ message: 'At least one option is required' });
        }
        return true;
      }
    }),
    min_value: Yup.mixed().test({
      name: 'min-value-required-for-scale',
      test: function(value, context) {
        const { response_type } = context.parent;
        if (response_type === 'scale') {
          return value !== undefined && value !== null && value !== '' || 
            this.createError({ message: 'Minimum value is required' });
        }
        return true;
      }
    }),
    max_value: Yup.mixed().test({
      name: 'max-value-required-for-scale',
      test: function(value, context) {
        const { response_type, min_value } = context.parent;
        if (response_type === 'scale') {
          if (value === undefined || value === null || value === '') {
            return this.createError({ message: 'Maximum value is required' });
          }
          if (min_value !== undefined && min_value !== null && value <= min_value) {
            return this.createError({ message: 'Maximum value must be greater than minimum value' });
          }
        }
        return true;
      }
    })
  });

  const formik = useFormik<QuestionFormData>({
    initialValues: {
      text: '',
      response_type: '',
      options: [],
      min_value: '',
      max_value: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        // Format the data for the API
        const formattedData = {
          ...values,
          options: values.response_type === 'select' || values.response_type === 'multiselect' 
            ? values.options.map(opt => opt.value) 
            : undefined,
          min_value: values.response_type === 'scale' ? values.min_value : undefined,
          max_value: values.response_type === 'scale' ? values.max_value : undefined
        };
        
        if (isEditMode) {
          await questionApi.updateQuestion(parseInt(id), formattedData);
        } else {
          await questionApi.createQuestion(formattedData);
        }
        
        navigate('/admin/questions');
      } catch (err: any) {
        console.error('Error saving question:', err);
        setError(err.response?.data?.error || 'Failed to save question');
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    const fetchQuestion = async () => {
      if (id) {
        try {
          const response = await questionApi.getQuestion(parseInt(id));
          const question = response.data.data;
          
          formik.setValues({
            text: question.text,
            response_type: question.response_type,
            options: question.options ? question.options.map((opt: string, index: number) => ({
              id: `option-${index}`,
              value: opt
            })) : [],
            min_value: question.min_value || '',
            max_value: question.max_value || ''
          });
        } catch (err: any) {
          console.error('Error fetching question:', err);
          setError(err.response?.data?.error || 'Failed to load question');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchQuestion();
  }, [id]);

  const handleAddOption = () => {
    formik.setFieldValue('options', [
      ...formik.values.options,
      { id: `option-${Date.now()}`, value: '' }
    ]);
  };

  const handleRemoveOption = (id: string) => {
    formik.setFieldValue(
      'options',
      formik.values.options.filter(option => option.id !== id)
    );
  };

  const handleOptionChange = (id: string, value: string) => {
    formik.setFieldValue(
      'options',
      formik.values.options.map(option => 
        option.id === id ? { ...option, value } : option
      )
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/admin/questions"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">
          {isEditMode ? 'Edit Survey Question' : 'Create Survey Question'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {loading && !formik.values.text ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <TextField
                  fullWidth
                  id="text"
                  name="text"
                  label="Question Text"
                  value={formik.values.text}
                  onChange={formik.handleChange}
                  error={formik.touched.text && Boolean(formik.errors.text)}
                  helperText={formik.touched.text && formik.errors.text}
                  multiline
                  rows={2}
                />
              </Box>

              <Box>
                <FormControl fullWidth error={formik.touched.response_type && Boolean(formik.errors.response_type)}>
                  <InputLabel id="response-type-label">Response Type</InputLabel>
                  <Select
                    labelId="response-type-label"
                    id="response_type"
                    name="response_type"
                    value={formik.values.response_type}
                    onChange={formik.handleChange}
                    label="Response Type"
                  >
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="select">Single Select</MenuItem>
                    <MenuItem value="multiselect">Multi Select</MenuItem>
                    <MenuItem value="scale">Scale (1-10)</MenuItem>
                  </Select>
                  {formik.touched.response_type && formik.errors.response_type && (
                    <FormHelperText>{formik.errors.response_type}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              {(formik.values.response_type === 'select' || formik.values.response_type === 'multiselect') && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Options
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {formik.values.options.map((option, index) => (
                      <Box key={option.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TextField
                          fullWidth
                          value={option.value}
                          onChange={(e) => handleOptionChange(option.id, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          error={
                            Boolean(
                              formik.touched.options && 
                              formik.errors.options && 
                              Array.isArray(formik.errors.options) && 
                              formik.errors.options[index] && 
                              (formik.errors.options[index] as any)?.value
                            )
                          }
                          helperText={
                            formik.touched.options && 
                            formik.errors.options && 
                            Array.isArray(formik.errors.options) && 
                            formik.errors.options[index] && 
                            (formik.errors.options[index] as any)?.value
                          }
                        />
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveOption(option.id)}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                  <Button 
                    startIcon={<AddIcon />} 
                    onClick={handleAddOption}
                    variant="outlined"
                  >
                    Add Option
                  </Button>
                  {formik.touched.options && 
                   typeof formik.errors.options === 'string' && (
                    <FormHelperText error>{formik.errors.options}</FormHelperText>
                  )}
                </Box>
              )}

              {formik.values.response_type === 'scale' && (
                <Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      id="min_value"
                      name="min_value"
                      label="Minimum Value"
                      type="number"
                      value={formik.values.min_value}
                      onChange={formik.handleChange}
                      error={formik.touched.min_value && Boolean(formik.errors.min_value)}
                      helperText={formik.touched.min_value && formik.errors.min_value}
                    />
                    <TextField
                      fullWidth
                      id="max_value"
                      name="max_value"
                      label="Maximum Value"
                      type="number"
                      value={formik.values.max_value}
                      onChange={formik.handleChange}
                      error={formik.touched.max_value && Boolean(formik.errors.max_value)}
                      helperText={formik.touched.max_value && formik.errors.max_value}
                    />
                  </Box>
                </Box>
              )}

              <Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button 
                    component={Link} 
                    to="/admin/questions"
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : isEditMode ? 'Update' : 'Create'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </form>
        </Paper>
      )}
    </Box>
  );
};

export default QuestionForm;
