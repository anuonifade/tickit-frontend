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
import { questionApi } from '../../../services/api';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../shared/ConfirmDialog';

interface Question {
  id: number;
  text: string;
  response_type: string;
  options: string[];
  survey_workflow_id: number | null;
  workflow_name: string | null;
  position: number | null;
  created_at: string;
  updated_at: string;
}

const QuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [responseTypeFilter, setResponseTypeFilter] = useState<string>('all');
  const [workflowFilter, setWorkflowFilter] = useState<string>('all');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (searchTerm) {
        params.query = searchTerm;
      }
      
      if (responseTypeFilter !== 'all') {
        params.response_type = responseTypeFilter;
      }
      
      if (workflowFilter !== 'all') {
        params.workflow_id = workflowFilter;
      }
      
      const response = await questionApi.getQuestions(params);
      setQuestions(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching questions:', err);
      setError(err.response?.data?.error || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, rowsPerPage, responseTypeFilter, workflowFilter]);

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
    fetchQuestions();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleResponseTypeFilterChange = (event: any) => {
    setResponseTypeFilter(event.target.value);
    setPage(0);
  };

  const handleWorkflowFilterChange = (event: any) => {
    setWorkflowFilter(event.target.value);
    setPage(0);
  };

  const handleDeleteClick = (id: number) => {
    setQuestionToDelete(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (questionToDelete) {
      try {
        await questionApi.deleteQuestion(questionToDelete);
        setQuestions(questions.filter(question => question.id !== questionToDelete));
        setConfirmOpen(false);
        setQuestionToDelete(null);
      } catch (err: any) {
        console.error('Error deleting question:', err);
        setError(err.response?.data?.error || 'Failed to delete question');
      }
    }
  };

  const getResponseTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Text';
      case 'number': return 'Number';
      case 'boolean': return 'Yes/No';
      case 'select': return 'Single Select';
      case 'multiselect': return 'Multi-select';
      case 'scale': return 'Scale';
      default: return type;
    }
  };

  const getResponseTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'primary';
      case 'number': return 'secondary';
      case 'boolean': return 'success';
      case 'select': return 'info';
      case 'multiselect': return 'warning';
      case 'scale': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Survey Questions</Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            to="/admin/question-templates"
            sx={{ mr: 2 }}
          >
            Manage Templates
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/admin/questions/new"
          >
            Create Question
          </Button>
        </Box>
      </Box>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Survey questions can be added to survey workflows to create comprehensive mental health assessments.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and filter bar */}
      <Paper component="form" onSubmit={handleSearch} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 60%' } }}>
            <TextField
              fullWidth
              placeholder="Search questions"
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
          
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 20%' } }}>
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
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="boolean">Yes/No</MenuItem>
                <MenuItem value="select">Single Select</MenuItem>
                <MenuItem value="multiselect">Multi-select</MenuItem>
                <MenuItem value="scale">Scale</MenuItem>
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
                  <TableCell>Question Text</TableCell>
                  <TableCell>Response Type</TableCell>
                  <TableCell>Workflow</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {questions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>{question.text}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getResponseTypeLabel(question.response_type)} 
                        color={getResponseTypeColor(question.response_type) as any} 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      {question.workflow_name ? (
                        <Chip 
                          label={question.workflow_name} 
                          color="primary" 
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not assigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton 
                          color="primary" 
                          component={Link} 
                          to={`/admin/questions/${question.id}/edit`}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteClick(question.id)}
                          disabled={!!question.workflow_name}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {questions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No questions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={questions.length}
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
        title="Delete Question"
        content="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
};

export default QuestionList;
