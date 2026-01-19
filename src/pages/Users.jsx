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
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  TableFooter
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { mockApi, mockUsers, mockTeams, USE_MOCK_DATA } from '../data/mockData';
import React from 'react' 
const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    team_id: '',
    is_active: true
  });
  const [teams, setTeams] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchUsers();
      fetchTeams();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      if (USE_MOCK_DATA) {
        const response = await mockApi.getUsers();
        setUsers(response.data);
      } else {
        const response = await api.get('/users');
        setUsers(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      if (USE_MOCK_DATA) {
        const response = await mockApi.getTeams();
        setTeams(response.data);
      } else {
        const response = await api.get('/teams');
        setTeams(response.data);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/users', formData);
      setOpenDialog(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/users/${editingUser.id}`, formData);
      setOpenDialog(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'USER',
      team_id: '',
      is_active: true
    });
    setEditingUser(null);
  };

  const openEditDialog = (userData) => {
    setEditingUser(userData);
    setFormData({
      name: userData.name,
      email: userData.email,
      password: '',
      role: userData.role,
      team_id: userData.team_id || '',
      is_active: userData.is_active
    });
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
  const totalPages = Math.ceil(users.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

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
            <Typography variant="h4">User Management</Typography>
            <Chip
              label="ADMIN ONLY"
              color="primary"
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Create, edit, and manage user accounts and permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
        >
          New User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Chip label={u.role} color={u.role === 'ADMIN' ? 'primary' : 'default'} size="small" />
                </TableCell>
                <TableCell>{u.team_id ? `Team ${u.team_id}` : '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={u.is_active ? 'Active' : 'Inactive'}
                    color={u.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => openEditDialog(u)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(u.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {users.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body2" color="text.secondary">
                        Showing {startIndex + 1} to {Math.min(endIndex, users.length)} of {users.length} users
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
        <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            margin="normal"
            required={!editingUser}
            helperText={editingUser ? 'Leave empty to keep current password' : ''}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Team</InputLabel>
            <Select
              value={formData.team_id}
              label="Team"
              onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
            >
              <MenuItem value="">None</MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={editingUser ? handleUpdate : handleCreate}
            variant="contained"
            disabled={!formData.name || !formData.email || (!editingUser && !formData.password)}
          >
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
