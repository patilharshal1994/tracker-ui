import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { ArrowBack, Edit, Delete, Person, Business, Group } from '@mui/icons-material';
import toast from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { USE_MOCK_DATA } from '../data/mockData';
import { canAccess, ROLES } from '../utils/roleHierarchy';
import { decodeId } from '../utils/idEncoder';
import React from 'react';

const ProjectDetail = () => {
  const { id: encodedId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [members, setMembers] = useState([]);
  const [tickets, setTickets] = useState([]);

  // Try to decode ID if it's encoded, otherwise use as-is (for UUIDs)
  const projectId = (() => {
    if (!encodedId) return null;
    // Check if it looks like a UUID (contains hyphens)
    if (encodedId.includes('-')) {
      return encodedId; // It's already a UUID
    }
    // Try to decode it (might be base64 encoded)
    const decoded = decodeId(encodedId);
    if (decoded) {
      // If decodeId returns a number, it was an encoded integer ID
      // But projects use UUIDs, so we should use the original encodedId
      // Actually, let's try to decode as base64 string for UUID
      try {
        const uuidDecoded = atob(encodedId);
        // Check if decoded string looks like a UUID
        if (uuidDecoded.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          return uuidDecoded;
        }
      } catch (e) {
        // Not base64, use as-is
      }
    }
    // Use as-is (might be a UUID or other format)
    return encodedId;
  })();

  useEffect(() => {
    if (projectId) {
      fetchProject();
    } else {
      setError('Invalid project ID');
      setLoading(false);
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      
      if (USE_MOCK_DATA) {
        // Mock data would go here
        setError('Mock data not implemented for project detail');
      } else {
        // Backend returns: { data: {...} }
        const response = await api.get(`/projects/${projectId}`);
        const projectData = response.data?.data || response.data;
        setProject(projectData);
        
        // Fetch project members if available
        if (projectData.members) {
          setMembers(projectData.members || []);
        }
        
        // Fetch tickets for this project
        try {
          const ticketsResponse = await api.get('/tickets', {
            params: { project_id: projectId }
          });
          setTickets(ticketsResponse.data?.data || ticketsResponse.data || []);
        } catch (err) {
          console.error('Failed to load tickets:', err);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load project');
      toast.error(err.response?.data?.error || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project deleted successfully! 🗑️');
      navigate('/projects');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to delete project';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !project) {
    return (
      <Box>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/projects')} sx={{ mb: 2 }}>
          Back to Projects
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!project) return null;

  const canEdit = canAccess(user, 'manage_projects');
  const canDelete = canAccess(user, 'manage_projects');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/projects')} sx={{ mb: 2 }}>
          Back to Projects
        </Button>
        {canEdit && (
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/projects/${projectId}/edit`)}
            >
              Edit
            </Button>
            {canDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Project Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, fontSize: '2rem' }}>
                <Business />
              </Avatar>
              <Box flex={1}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {project.name}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                  {project.team_name && (
                    <Chip
                      icon={<Group />}
                      label={project.team_name}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {project.organization_name && (
                    <Chip
                      icon={<Business />}
                      label={project.organization_name}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                  <Chip
                    label={project.is_active ? 'Active' : 'Inactive'}
                    color={project.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            {project.description && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Description
                </Typography>
                <Typography
                  variant="body1"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Project Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Project Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Person fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Created By:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {project.creator_name || 'Unknown'}
                  </Typography>
                </Box>
              </Grid>
              {project.created_at && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
              {project.updated_at && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated: {new Date(project.updated_at).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
              {project.member_count !== undefined && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Members: {project.member_count || members.length}
                  </Typography>
                </Grid>
              )}
              {project.ticket_count !== undefined && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Tickets: {project.ticket_count || tickets.length}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Project Members */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Project Members
            </Typography>
            <Divider sx={{ my: 2 }} />
            {members.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No members assigned to this project
              </Typography>
            ) : (
              <Box>
                {members.map((member) => (
                  <Box key={member.id} display="flex" alignItems="center" gap={1} mb={1}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                      {member.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {member.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.email}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Project Tickets */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, boxShadow: 2, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Tickets ({tickets.length})
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate(`/tickets?project_id=${projectId}`)}
              >
                View All Tickets
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {tickets.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                No tickets found for this project
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Title</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Priority</strong></TableCell>
                      <TableCell><strong>Assignee</strong></TableCell>
                      <TableCell><strong>Created</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tickets.slice(0, 10).map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                      >
                        <TableCell>
                          <Typography variant="body2">{ticket.title}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ticket.status}
                            size="small"
                            color={
                              ticket.status === 'SOLVED' || ticket.status === 'CLOSED'
                                ? 'success'
                                : ticket.status === 'IN_PROGRESS'
                                ? 'primary'
                                : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ticket.priority}
                            size="small"
                            color={
                              ticket.priority === 'HIGH' || ticket.priority === 'URGENT'
                                ? 'error'
                                : ticket.priority === 'MEDIUM'
                                ? 'warning'
                                : 'success'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {ticket.assignee_name || '-'}
                        </TableCell>
                        <TableCell>
                          {ticket.created_at
                            ? new Date(ticket.created_at).toLocaleDateString()
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectDetail;
