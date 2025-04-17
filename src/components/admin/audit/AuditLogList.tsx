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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SecurityIcon from '@mui/icons-material/Security';
import { auditLogApi } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface AuditLog {
  id: number;
  action: string;
  admin_id: number | null;
  admin_email: string | null;
  admin_name: string | null;
  auditable_type: string | null;
  auditable_id: number | null;
  ip_address: string;
  user_agent: string | null;
  created_at: string;
}

const AuditLogList: React.FC = () => {
  const { admin } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await auditLogApi.getAuditLogs({
        page: page + 1,
        per_page: rowsPerPage,
        query: searchTerm || undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        auditable_type: entityFilter !== 'all' ? entityFilter : undefined
      });
      
      setAuditLogs(response.data.audit_logs);
      setTotalCount(response.data.total_count);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err.response?.data?.error || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, rowsPerPage, actionFilter, entityFilter]);

  // Only super admins can access audit logs
  if (admin?.role !== 'super_admin') {
    return <Navigate to="/admin/unauthorized" replace />;
  }

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
    fetchAuditLogs();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleActionFilterChange = (event: SelectChangeEvent) => {
    setActionFilter(event.target.value);
    setPage(0);
  };

  const handleEntityFilterChange = (event: SelectChangeEvent) => {
    setEntityFilter(event.target.value);
    setPage(0);
  };

  const handleExport = async () => {
    try {
      const response = await auditLogApi.exportAuditLogs();
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });
      
      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error exporting audit logs:', err);
      setError(err.response?.data?.error || 'Failed to export audit logs');
    }
  };

  const getActionChipColor = (action: string) => {
    if (action.includes('create')) return 'success';
    if (action.includes('update')) return 'info';
    if (action.includes('delete') || action.includes('destroy')) return 'error';
    if (action.includes('show') || action.includes('index')) return 'default';
    return 'primary';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SecurityIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
          <Typography variant="h4">Audit Logs</Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileDownloadIcon />}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </Box>

      <Typography variant="body1" sx={{ mb: 3 }}>
        This page displays a comprehensive audit trail of all actions performed in the system, as required for HIPAA compliance.
      </Typography>

      {/* Search and filter bar */}
      <Paper component="form" onSubmit={handleSearch} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
            <TextField
              fullWidth
              placeholder="Search by admin, IP address, or action"
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
              <InputLabel id="action-filter-label">Action Type</InputLabel>
              <Select
                labelId="action-filter-label"
                id="action-filter"
                value={actionFilter}
                onChange={handleActionFilterChange}
                label="Action Type"
              >
                <MenuItem value="all">All Actions</MenuItem>
                <MenuItem value="show">View</MenuItem>
                <MenuItem value="index">List</MenuItem>
                <MenuItem value="create">Create</MenuItem>
                <MenuItem value="update">Update</MenuItem>
                <MenuItem value="delete">Delete</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 15%' } }}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="entity-filter-label">Entity Type</InputLabel>
              <Select
                labelId="entity-filter-label"
                id="entity-filter"
                value={entityFilter}
                onChange={handleEntityFilterChange}
                label="Entity Type"
              >
                <MenuItem value="all">All Entities</MenuItem>
                <MenuItem value="Patient">Patient</MenuItem>
                <MenuItem value="SurveyResponse">Survey Response</MenuItem>
                <MenuItem value="Question">Question</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader aria-label="audit logs table">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Entity Type</TableCell>
                <TableCell>Entity ID</TableCell>
                <TableCell>IP Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={log.action} 
                        color={getActionChipColor(log.action) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {log.admin_name || log.admin_email || 'System'}
                    </TableCell>
                    <TableCell>{log.auditable_type || 'N/A'}</TableCell>
                    <TableCell>{log.auditable_id || 'N/A'}</TableCell>
                    <TableCell>{log.ip_address}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default AuditLogList;
