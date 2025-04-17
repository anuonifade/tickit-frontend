import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { questionTemplateApi } from '../../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../shared/ConfirmDialog';

interface QuestionTemplate {
  id: number;
  text: string;
  category: string;
  response_type: string;
  options: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

const QuestionTemplateList: React.FC = () => {
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [responseTypeFilter, setResponseTypeFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  
  const navigate = useNavigate();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (searchTerm) {
        params.query = searchTerm;
      }
      
      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      
      if (responseTypeFilter !== 'all') {
        params.response_type = responseTypeFilter;
      }
      
      if (activeFilter !== 'all') {
        params.active = activeFilter === 'active';
      }
      
      const response = await questionTemplateApi.getTemplates(params);
      setTemplates(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching question templates:', err);
      setError(err.response?.data?.error || 'Failed to load question templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await questionTemplateApi.getCategories();
      setCategories(response.data.categories);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, [page, rowsPerPage, categoryFilter, responseTypeFilter, activeFilter]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(0);
    fetchTemplates();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryFilterChange = (event: any) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };

  const handleResponseTypeFilterChange = (event: any) => {
    setResponseTypeFilter(event.target.value);
    setPage(0);
  };

  const handleActiveFilterChange = (event: any) => {
    setActiveFilter(event.target.value);
    setPage(0);
  };

  const handleDeleteClick = (id: number) => {
    setTemplateToDelete(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (templateToDelete) {
      try {
        await questionTemplateApi.deleteTemplate(templateToDelete);
        setTemplates(templates.filter(template => template.id !== templateToDelete));
        setConfirmOpen(false);
        setTemplateToDelete(null);
      } catch (err: any) {
        console.error('Error deleting template:', err);
        setError(err.response?.data?.error || 'Failed to delete template');
      }
    }
  };

  const handleCreateQuestion = async (templateId: number) => {
    try {
      const response = await questionTemplateApi.createQuestion(templateId);
      navigate(`/admin/questions/${response.data.data.id}/edit`);
    } catch (err: any) {
      console.error('Error creating question from template:', err);
      setError(err.response?.data?.error || 'Failed to create question from template');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Question Templates</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/admin/question-templates/new"
        >
          Add Template
        </Button>
      </Box>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Question templates are reusable question formats that can be used to create new survey questions.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and filter bar */}
      <Paper component="form" onSubmit={handleSearch} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 32%' } }}>
            <TextField
              fullWidth
              placeholder="Search templates"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 15%' } }}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 15%' } }}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="response-type-filter-label">Response Type</InputLabel>
              <Select
                labelId="response-type-filter-label"
                id="response-type-filter"
                value={responseTypeFilter}
                onChange={handleResponseTypeFilterChange}
                label="Response Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="select">Select</MenuItem>
                <MenuItem value="multiselect">Multi-select</MenuItem>
                <MenuItem value="scale">Scale</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 15%' } }}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="active-filter-label">Status</InputLabel>
              <Select
                labelId="active-filter-label"
                id="active-filter"
                value={activeFilter}
                onChange={handleActiveFilterChange}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 15%' } }}>
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ height: '56px' }}
            >
              Search
            </Button>
          </Box>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Text</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Response Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.text}</TableCell>
                    <TableCell>
                      <Chip label={template.category} color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{template.response_type}</TableCell>
                    <TableCell>
                      <Chip 
                        label={template.active ? 'Active' : 'Inactive'} 
                        color={template.active ? 'success' : 'default'} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Create Question">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleCreateQuestion(template.id)}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          color="primary" 
                          component={Link} 
                          to={`/admin/question-templates/${template.id}/edit`}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteClick(template.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {templates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No question templates found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={templates.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </>
      )}
      
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Question Template"
        content="Are you sure you want to delete this question template? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
};

export default QuestionTemplateList;
