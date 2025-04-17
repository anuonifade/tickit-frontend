import React from 'react';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';

const WorkflowList: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Survey Workflows</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/admin/workflows/new"
        >
          Create Workflow
        </Button>
      </Box>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Survey workflows allow you to organize questions into structured assessments for patients.
      </Typography>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Survey workflow management is coming soon. This feature will allow you to create and manage survey workflows with multiple questions.
        </Alert>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          In the meantime, you can manage individual survey questions and question templates using the Questions and Question Templates sections.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            to="/admin/questions"
            sx={{ mr: 2 }}
          >
            Manage Questions
          </Button>
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            to="/admin/question-templates"
          >
            Manage Question Templates
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default WorkflowList;
