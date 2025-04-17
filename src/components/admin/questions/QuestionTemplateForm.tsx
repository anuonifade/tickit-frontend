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
  Chip,
  IconButton,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { questionTemplateApi } from '../../../services/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface Option {
  id: string;
  value: string;
}

interface QuestionTemplateFormData {
  title: string;
  content: string;
  category: string;
  response_type: string;
  options: Option[];
  min_value?: number | '';
  max_value?: number | '';
  active: boolean;
  required: boolean;
}

// Utility functions for response type mapping
const mapResponseTypeToBackend = (responseType: string): string => {
  return responseType; // Add any mapping logic if needed
};

const mapResponseTypeToFrontend = (responseType: string): string => {
  return responseType; // Add any mapping logic if needed
};

const QuestionTemplateForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  
  const isEditMode = !!id;

  const validationSchema = Yup.object({
    title: Yup.string().required('Question title is required'),
    content: Yup.string().required('Question content is required'),
    category: Yup.string().required('Category is required'),
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

  const formik = useFormik<QuestionTemplateFormData>({
    initialValues: {
      title: '',
      content: '',
      category: '',
      response_type: '',
      options: [],
      min_value: '',
      max_value: '',
      active: true,
      required: true
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        
        // Format the data for the API
        const formattedData = {
          title: values.title,
          content: values.content,
          category: values.category,
          response_type: mapResponseTypeToBackend(values.response_type),
          required: values.required,
          active: values.active,
          options: values.response_type === 'select' || values.response_type === 'multiselect' 
            ? values.options.map(opt => opt.value) 
            : undefined,
          min_value: values.response_type === 'scale' ? values.min_value : undefined,
          max_value: values.response_type === 'scale' ? values.max_value : undefined
        };
        
        if (isEditMode) {
          await questionTemplateApi.updateTemplate(Number(id), formattedData);
          setSuccess('Question template updated successfully!');
        } else {
          await questionTemplateApi.createTemplate(formattedData);
          setSuccess('Question template created successfully!');
        }
        navigate('/admin/questions/templates');
      } catch (err: any) {
        console.error('Error saving question template:', err);
        if (err.response?.data?.errors) {
          const errorMessages = err.response.data.errors.join(', ');
          setError(errorMessages);
        } else {
          setError(err.message || 'Failed to save question template');
        }
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await questionTemplateApi.getCategories();
        setCategories(response.data.categories);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
      }
    };

    const fetchTemplate = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await questionTemplateApi.getTemplate(parseInt(id));
          const template = response.data.data;
          
          formik.setValues({
            title: template.title,
            content: template.content,
            category: template.category,
            response_type: mapResponseTypeToFrontend(template.response_type),
            options: template.options ? template.options.map((opt: string, index: number) => ({
              id: `option-${index}`,
              value: opt
            })) : [],
            min_value: template.min_value || '',
            max_value: template.max_value || '',
            active: template.active,
            required: template.required || true
          });
        } catch (err: any) {
          console.error('Error fetching template:', err);
          setError('Failed to load question template');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchCategories();
    fetchTemplate();
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

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      formik.setFieldValue('category', newCategory);
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/admin/question-templates"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">
          {isEditMode ? 'Edit Question Template' : 'Create Question Template'}
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

      {loading && !formik.values.title ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {/* Question Title */}
              <Box sx={{ flex: '1 1 100%' }}>
                <TextField
                  fullWidth
                  id="title"
                  name="title"
                  label="Question Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  variant="outlined"
                />
              </Box>
              
              {/* Question Content */}
              <Box sx={{ flex: '1 1 100%' }}>
                <TextField
                  fullWidth
                  id="content"
                  name="content"
                  label="Question Content"
                  value={formik.values.content}
                  onChange={formik.handleChange}
                  error={formik.touched.content && Boolean(formik.errors.content)}
                  helperText={formik.touched.content && formik.errors.content}
                  multiline
                  rows={3}
                  variant="outlined"
                />
              </Box>

              {/* Category */}
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
                <FormControl fullWidth error={formik.touched.category && Boolean(formik.errors.category)} variant="outlined">
                  <InputLabel id="category-label">Category</InputLabel>
                  {showNewCategoryInput ? (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2 }}>
                      <TextField
                        fullWidth
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New category name"
                        size="small"
                        variant="outlined"
                      />
                      <Button 
                        variant="contained" 
                        onClick={handleAddCategory}
                        sx={{ ml: 1 }}
                      >
                        Add
                      </Button>
                      <Button 
                        onClick={() => setShowNewCategoryInput(false)}
                        sx={{ ml: 1 }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <Select
                        labelId="category-label"
                        id="category"
                        name="category"
                        value={formik.values.category}
                        onChange={formik.handleChange}
                        label="Category"
                      >
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>{category}</MenuItem>
                        ))}
                      </Select>
                      <Box sx={{ mt: 1 }}>
                        <Button 
                          startIcon={<AddIcon />}
                          onClick={() => setShowNewCategoryInput(true)}
                          size="small"
                        >
                          Add New Category
                        </Button>
                      </Box>
                    </>
                  )}
                  {formik.touched.category && formik.errors.category && (
                    <FormHelperText>{formik.errors.category}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              {/* Response Type */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                <FormControl fullWidth error={formik.touched.response_type && Boolean(formik.errors.response_type)} variant="outlined">
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
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="boolean">Yes/No</MenuItem>
                    <MenuItem value="select">Single Select</MenuItem>
                    <MenuItem value="multiselect">Multi-select</MenuItem>
                    <MenuItem value="scale">Scale</MenuItem>
                  </Select>
                  {formik.touched.response_type && formik.errors.response_type && (
                    <FormHelperText>{formik.errors.response_type}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              {/* Options for Select/Multiselect */}
              {(formik.values.response_type === 'select' || formik.values.response_type === 'multiselect') && (
                <Box sx={{ flex: '1 1 100%' }}>
                  <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Response Options
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {formik.values.options.map((option, index) => (
                        <Box key={option.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <TextField
                            fullWidth
                            value={option.value}
                            onChange={(e) => handleOptionChange(option.id, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            variant="outlined"
                            size="small"
                            error={Boolean(
                              formik.touched.options && 
                              formik.errors.options && 
                              Array.isArray(formik.errors.options) && 
                              formik.errors.options[index] && 
                              (formik.errors.options[index] as any)?.value
                            )}
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
                      size="small"
                    >
                      Add Option
                    </Button>
                    {formik.touched.options && 
                     typeof formik.errors.options === 'string' && (
                      <FormHelperText error>{formik.errors.options}</FormHelperText>
                    )}
                  </Paper>
                </Box>
              )}

              {/* Scale Min/Max for Scale type */}
              {formik.values.response_type === 'scale' && (
                <Box sx={{ flex: '1 1 100%' }}>
                  <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Scale Range
                    </Typography>
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
                        variant="outlined"
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
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Define the minimum and maximum values for the scale question
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Toggle Switches */}
              <Box sx={{ flex: '1 1 100%' }}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.active}
                          onChange={(e) => formik.setFieldValue('active', e.target.checked)}
                          name="active"
                          color="primary"
                        />
                      }
                      label="Active"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Active templates can be used to create new questions
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.required}
                          onChange={(e) => formik.setFieldValue('required', e.target.checked)}
                          name="required"
                          color="primary"
                        />
                      }
                      label="Required"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Determines if this question requires an answer when used in surveys
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Form Buttons */}
              <Box sx={{ flex: '1 1 100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button 
                    component={Link} 
                    to="/admin/question-templates"
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

export default QuestionTemplateForm;
