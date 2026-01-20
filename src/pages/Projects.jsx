import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Chip,
  Pagination,
  TableFooter,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import toast from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { mockApi, mockProjects, mockTeams, USE_MOCK_DATA } from '../data/mockData';
import { encodeId } from '../utils/idEncoder';
import RichTextEditor from '../components/RichTextEditor';
import { canAccess, ROLES, getRoleDisplayName, getRoleColor } from '../utils/roleHierarchy';
import React from 'react'
const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', team_id: '' });
  const [formErrors, setFormErrors] = useState({ name: '', description: '' });
  const [teams, setTeams] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const canCreateProjects = canAccess(user, 'create_projects');
  const canViewAllProjects = canAccess(user, 'view_all_projects');

  useEffect(() => {
    fetchProjects();
    // Fetch teams for users who can create projects (SUPER_ADMIN, ORG_ADMIN, TEAM_LEAD)
    if (canCreateProjects) {
      fetchTeams();
    }
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      if (USE_MOCK_DATA) {
        const response = await mockApi.getProjects();
        setProjects(response.data);
      } else {
        // Backend returns: { data: [...], pagination: {...} }
        const response = await api.get('/projects', { params: { page, limit: rowsPerPage } });
        setProjects(response.data?.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      if (USE_MOCK_DATA) {
        const response = await mockApi.getTeams();
        // Filter teams by organization for Org Admin
        let filteredTeams = response.data;
        if (user?.role === ROLES.ORG_ADMIN && user?.organization_id) {
          filteredTeams = response.data.filter(t => t.organization_id === user.organization_id);
        }
        setTeams(filteredTeams);
      } else {
        // Backend returns: { data: [...], pagination: {...} }
        // Backend automatically filters based on user role
        const response = await api.get('/teams');
        const teamsData = response.data?.data || response.data || [];
        console.log('Teams for Projects API Response:', response.data); // Debug log
        setTeams(Array.isArray(teamsData) ? teamsData : []);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate name
    const trimmedName = formData.name?.trim() || '';
    if (!trimmedName) {
      errors.name = 'Project name is required';
      isValid = false;
    } else if (trimmedName.length < 2) {
      errors.name = 'Project name must be at least 2 characters';
      isValid = false;
    } else if (trimmedName.length > 255) {
      errors.name = 'Project name must be less than 255 characters';
      isValid = false;
    } else {
      // Check for duplicate name (case-insensitive)
      const duplicateProject = projects.find(
        p => p.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (duplicateProject) {
        errors.name = 'Project name already exists';
        isValid = false;
      }
    }

    // Validate description length (if it's plain text)
    if (formData.description && typeof formData.description === 'string' && formData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleCreate = async () => {
    // Clear previous errors
    setFormErrors({ name: '', description: '' });
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Backend returns: { data: {...}, message: '...' }
      const response = await api.post('/projects', {
        name: formData.name.trim(),
        description: formData.description || null,
        team_id: formData.team_id || null
      });
      const project = response.data?.data || response.data;
      toast.success(`Project "${project.name || formData.name}" created successfully! 📁`);
      setOpenDialog(false);
      setFormData({ name: '', description: '', team_id: '' });
      setFormErrors({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to create project';
      // Check if it's a duplicate name error
      if (errorMsg.toLowerCase().includes('already exists') || errorMsg.toLowerCase().includes('duplicate')) {
        setFormErrors({ name: errorMsg, description: '' });
      } else {
        setError(errorMsg);
      }
      toast.error(errorMsg);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(projects.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedProjects = projects.slice(startIndex, endIndex);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Typography variant="h4">Projects</Typography>
            <Chip
              label={getRoleDisplayName(user?.role)}
              color={getRoleColor(user?.role)}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {user?.role === ROLES.SUPER_ADMIN
              ? 'Manage all projects across all organizations'
              : user?.role === ROLES.ORG_ADMIN
              ? 'Manage projects within your organization'
              : user?.role === ROLES.TEAM_LEAD
              ? 'Manage projects in your team'
              : 'View projects you are assigned to'}
          </Typography>
        </Box>
        {canCreateProjects && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{ borderRadius: 2 }}
          >
            New Project
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ 
              bgcolor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.02)' 
            }}>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Team</strong></TableCell>
              <TableCell><strong>Created By</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              paginatedProjects.map((project) => (
                <TableRow 
                  key={project.id} 
                  hover
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {project.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {project.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {project.team_name ? (
                      <Chip label={project.team_name} size="small" />
                    ) : (
                      <Typography variant="caption" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {project.creator_name?.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">{project.creator_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/projects/${project.id}`)}
                      sx={{ color: 'primary.main' }}
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {projects.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body2" color="text.secondary">
                        Showing {startIndex + 1} to {Math.min(endIndex, projects.length)} of {projects.length} projects
                      </Typography>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Rows per page</InputLabel>
                        <Select
                          value={rowsPerPage}
                          label="Rows per page"
                          onChange={handleRowsPerPageChange}
                        >
                          <MenuItem value={5}>5</MenuItem>
                          <MenuItem value={10}>10</MenuItem>
                          <MenuItem value={25}>25</MenuItem>
                          <MenuItem value={50}>50</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Project Name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setFormErrors({ ...formErrors, name: '' });
            }}
            onBlur={() => {
              const trimmedName = formData.name?.trim() || '';
              if (trimmedName && trimmedName.length < 2) {
                setFormErrors({ ...formErrors, name: 'Project name must be at least 2 characters' });
              } else if (trimmedName && trimmedName.length > 255) {
                setFormErrors({ ...formErrors, name: 'Project name must be less than 255 characters' });
              }
            }}
            margin="normal"
            required
            error={!!formErrors.name}
            helperText={formErrors.name}
            inputProps={{ maxLength: 255 }}
          />
          <Box sx={{ mt: 2, mb: 1 }}>
            <RichTextEditor
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              label="Description"
              minHeight={120}
            />
          </Box>
          {canCreateProjects && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Team (Optional)</InputLabel>
              <Select
                value={formData.team_id}
                onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                label="Team (Optional)"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!formData.name?.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;
