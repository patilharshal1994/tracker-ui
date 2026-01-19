import { useState, useEffect } from 'react';
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
  Chip,
  Pagination,
  TableFooter,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import toast from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { mockApi, mockTeams, mockOrganizations, USE_MOCK_DATA } from '../data/mockData';
import { canAccess, ROLES, getRoleDisplayName, getRoleColor } from '../utils/roleHierarchy';
import React from 'react' 
const Teams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({ name: '', organization_id: '' });
  const [organizations, setOrganizations] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (canAccess(user, 'manage_org_teams')) {
      fetchTeams();
      if (user?.role === ROLES.SUPER_ADMIN) {
        fetchOrganizations();
      }
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
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
        const response = await api.get('/teams');
        setTeams(response.data?.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      if (USE_MOCK_DATA) {
        setOrganizations(mockOrganizations);
      } else {
        // Backend returns: { data: [...], pagination: {...} }
        const response = await api.get('/organizations');
        setOrganizations(response.data?.data || []);
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
    }
  };

  const fetchTeamDetails = async (teamId) => {
    try {
      if (USE_MOCK_DATA) {
        const response = await mockApi.getTeam(teamId);
        setTeamDetails(response.data);
        setSelectedTeam(teamId);
      } else {
        // Backend returns: { data: {...} }
        const response = await api.get(`/teams/${teamId}`);
        setTeamDetails(response.data?.data || response.data);
        setSelectedTeam(teamId);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load team details');
    }
  };

  const handleCreate = async () => {
    try {
      // Set organization_id based on user role
      const teamData = {
        ...formData,
        organization_id: user?.role === ROLES.ORG_ADMIN ? user.organization_id : formData.organization_id
      };
      
      if (USE_MOCK_DATA) {
        const newTeam = {
          id: teams.length + 1,
          ...teamData,
          created_at: new Date().toISOString(),
          members: []
        };
        setTeams([...teams, newTeam]);
        toast.success(`Team "${formData.name}" created successfully! 👥`);
      } else {
        // Backend returns: { data: {...}, message: '...' }
        const response = await api.post('/teams', teamData);
        const createdTeam = response.data?.data || response.data;
        toast.success(`Team "${createdTeam.name || formData.name}" created successfully! 👥`);
      }
      setOpenDialog(false);
      resetForm();
      fetchTeams();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to create team';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleUpdate = async () => {
    try {
      const teamData = {
        ...formData,
        organization_id: user?.role === ROLES.ORG_ADMIN ? user.organization_id : formData.organization_id
      };
      
      if (USE_MOCK_DATA) {
        setTeams(teams.map(t => t.id === editingTeam.id ? { ...t, ...teamData } : t));
        toast.success(`Team "${formData.name}" updated successfully! ✏️`);
      } else {
        // Backend returns: { data: {...}, message: '...' }
        const response = await api.put(`/teams/${editingTeam.id}`, teamData);
        const updatedTeam = response.data?.data || response.data;
        toast.success(`Team "${updatedTeam.name || formData.name}" updated successfully! ✏️`);
      }
      setOpenDialog(false);
      resetForm();
      fetchTeams();
      if (selectedTeam === editingTeam.id) {
        fetchTeamDetails(editingTeam.id);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to update team';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      await api.delete(`/teams/${teamId}`);
      toast.success('Team deleted successfully! 🗑️');
      fetchTeams();
      if (selectedTeam === teamId) {
        setSelectedTeam(null);
        setTeamDetails(null);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to delete team';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      organization_id: user?.role === ROLES.ORG_ADMIN ? (user.organization_id || '') : '' 
    });
    setEditingTeam(null);
  };

  const openEditDialog = (team) => {
    setEditingTeam(team);
    setFormData({ 
      name: team.name,
      organization_id: team.organization_id || ''
    });
    setOpenDialog(true);
  };

  if (!canAccess(user, 'manage_org_teams')) {
    return <Alert severity="error">Access denied. You don't have permission to manage teams.</Alert>;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Pagination calculations
  const totalPages = Math.ceil(teams.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTeams = teams.slice(startIndex, endIndex);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Typography variant="h4">Team Management</Typography>
            <Chip
              label={user?.role === ROLES.SUPER_ADMIN ? 'Super Admin' : 'Org Admin'}
              color={user?.role === ROLES.SUPER_ADMIN ? 'error' : 'primary'}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {user?.role === ROLES.SUPER_ADMIN 
              ? 'Organize users into teams across all organizations'
              : 'Organize users into teams within your organization'}
          </Typography>
        </Box>
        {canAccess(user, 'create_teams') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
          >
            New Team
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              {user?.role === ROLES.SUPER_ADMIN && <TableCell>Organization</TableCell>}
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No teams found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTeams.map((team) => {
                const teamOrg = mockOrganizations.find(o => o.id === team.organization_id);
                return (
                  <TableRow key={team.id} hover>
                    <TableCell>{team.name}</TableCell>
                    {user?.role === ROLES.SUPER_ADMIN && (
                      <TableCell>{teamOrg ? teamOrg.name : '-'}</TableCell>
                    )}
                    <TableCell>
                      {new Date(team.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => fetchTeamDetails(team.id)}
                      >
                        <Visibility />
                      </IconButton>
                      {(user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ORG_ADMIN) && (
                        <>
                          <IconButton size="small" onClick={() => openEditDialog(team)}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(team.id)}>
                            <Delete />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
          {teams.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={user?.role === ROLES.SUPER_ADMIN ? 4 : 3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body2" color="text.secondary">
                        Showing {startIndex + 1} to {Math.min(endIndex, teams.length)} of {teams.length} teams
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

      {teamDetails && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {teamDetails.name} - Members
          </Typography>
          {teamDetails.members && teamDetails.members.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamDetails.members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.role}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No members in this team
            </Typography>
          )}
        </Paper>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTeam ? 'Edit Team' : 'Create Team'}</DialogTitle>
        <DialogContent>
          {user?.role === ROLES.SUPER_ADMIN && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Organization</InputLabel>
              <Select
                value={formData.organization_id}
                label="Organization"
                onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                required
              >
                <MenuItem value="">Select Organization</MenuItem>
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            fullWidth
            label="Team Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={editingTeam ? handleUpdate : handleCreate}
            variant="contained"
            disabled={!formData.name || (user?.role === ROLES.SUPER_ADMIN && !formData.organization_id)}
          >
            {editingTeam ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Teams;
