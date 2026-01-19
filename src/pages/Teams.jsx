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
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { mockApi, mockTeams, USE_MOCK_DATA } from '../data/mockData';
import React from 'react' 
const Teams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchTeams();
    }
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      if (USE_MOCK_DATA) {
        const response = await mockApi.getTeams();
        setTeams(response.data);
      } else {
        const response = await api.get('/teams');
        setTeams(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamDetails = async (teamId) => {
    try {
      if (USE_MOCK_DATA) {
        const response = await mockApi.getTeam(teamId);
        setTeamDetails(response.data);
        setSelectedTeam(teamId);
      } else {
        const response = await api.get(`/teams/${teamId}`);
        setTeamDetails(response.data);
        setSelectedTeam(teamId);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load team details');
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/teams', formData);
      setOpenDialog(false);
      setFormData({ name: '' });
      setEditingTeam(null);
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team');
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/teams/${editingTeam.id}`, formData);
      setOpenDialog(false);
      setFormData({ name: '' });
      setEditingTeam(null);
      fetchTeams();
      if (selectedTeam === editingTeam.id) {
        fetchTeamDetails(editingTeam.id);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update team');
    }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      await api.delete(`/teams/${teamId}`);
      fetchTeams();
      if (selectedTeam === teamId) {
        setSelectedTeam(null);
        setTeamDetails(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete team');
    }
  };

  const openEditDialog = (team) => {
    setEditingTeam(team);
    setFormData({ name: team.name });
    setOpenDialog(true);
  };

  if (user?.role !== 'ADMIN') {
    return <Alert severity="error">Access denied. Admin only.</Alert>;
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
              label="ADMIN ONLY"
              color="primary"
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Organize users into teams and assign them to projects
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingTeam(null);
            setFormData({ name: '' });
            setOpenDialog(true);
          }}
        >
          New Team
        </Button>
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
              paginatedTeams.map((team) => (
                <TableRow key={team.id} hover>
                  <TableCell>{team.name}</TableCell>
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
                    <IconButton size="small" onClick={() => openEditDialog(team)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(team.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {teams.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>
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
          <TextField
            fullWidth
            label="Team Name"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={editingTeam ? handleUpdate : handleCreate}
            variant="contained"
            disabled={!formData.name}
          >
            {editingTeam ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Teams;
