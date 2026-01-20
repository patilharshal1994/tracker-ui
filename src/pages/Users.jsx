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
import { Add, Edit, Delete, LockReset } from '@mui/icons-material';
import toast from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { mockApi, mockUsers, mockTeams, mockOrganizations, USE_MOCK_DATA } from '../data/mockData';
import { canAccess, canCreateRole, canResetPassword, ROLES, getRoleDisplayName, getRoleColor } from '../utils/roleHierarchy';
import React from 'react' 
const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
  const [resettingUser, setResettingUser] = useState(null);
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    organization_id: '',
    team_id: '',
    is_active: true
  });
  const [teams, setTeams] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (canAccess(user, 'manage_org_users') || canAccess(user, 'create_team_users')) {
      fetchUsers();
      fetchTeams();
      if (user?.role === ROLES.SUPER_ADMIN) {
        fetchOrganizations();
      }
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      if (USE_MOCK_DATA) {
        const response = await mockApi.getUsers();
        // Filter users based on role
        let filteredUsers = response.data;
        if (user?.role === ROLES.ORG_ADMIN && user?.organization_id) {
          // Org Admin can only see users in their organization
          filteredUsers = response.data.filter(u => u.organization_id === user.organization_id);
        } else if (user?.role === ROLES.TEAM_LEAD && user?.team_id) {
          // Team Lead can only see users in their team
          filteredUsers = response.data.filter(u => u.team_id === user.team_id);
        }
        setUsers(filteredUsers);
      } else {
        // Backend returns: { data: [...], pagination: {...} }
        // Backend automatically filters based on user role
        const response = await api.get('/users', { params: { page, limit: rowsPerPage } });
        setUsers(response.data?.data || []);
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
      console.error('Failed to load teams:', err);
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

  const handleCreate = async () => {
    try {
      // Set organization_id and team_id based on user role
      const userData = {
        ...formData,
        organization_id: user?.role === ROLES.ORG_ADMIN 
          ? user.organization_id 
          : user?.role === ROLES.TEAM_LEAD 
          ? user.organization_id 
          : formData.organization_id,
        team_id: user?.role === ROLES.TEAM_LEAD && formData.role === ROLES.USER
          ? user.team_id
          : formData.team_id || null
      };

      if (USE_MOCK_DATA) {
        const newUser = {
          id: mockUsers.length + 1,
          ...userData,
          is_active: true,
          created_at: new Date().toISOString()
        };
        setUsers([...users, newUser]);
        toast.success(`User "${formData.name}" created successfully! 👤`);
      } else {
        // Backend returns: { data: {...}, message: '...' }
        const response = await api.post('/users', userData);
        const createdUser = response.data?.data || response.data;
        toast.success(`User "${createdUser.name || formData.name}" created successfully! 👤`);
      }
      setOpenDialog(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to create user';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleUpdate = async () => {
    try {
      const userData = {
        ...formData,
        organization_id: user?.role === ROLES.ORG_ADMIN 
          ? user.organization_id 
          : formData.organization_id
      };

      if (USE_MOCK_DATA) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
        toast.success(`User "${formData.name}" updated successfully! ✏️`);
      } else {
        // Backend returns: { data: {...}, message: '...' }
        const response = await api.put(`/users/${editingUser.id}`, userData);
        const updatedUser = response.data?.data || response.data;
        toast.success(`User "${updatedUser.name || formData.name}" updated successfully! ✏️`);
      }
      setOpenDialog(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to update user';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      if (USE_MOCK_DATA) {
        setUsers(users.filter(u => u.id !== userId));
        toast.success('User deleted successfully! 🗑️');
      } else {
        await api.delete(`/users/${userId}`);
        toast.success('User deleted successfully! 🗑️');
      }
      fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete user';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleOpenResetPasswordDialog = (userData) => {
    setResettingUser(userData);
    setResetPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
    setOpenResetPasswordDialog(true);
  };

  const handleResetPassword = async () => {
    if (!resetPasswordData.newPassword || !resetPasswordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (resetPasswordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      if (USE_MOCK_DATA) {
        // In mock mode, just update the user's password (in real app, this would be hashed)
        setUsers(users.map(u => 
          u.id === resettingUser.id 
            ? { ...u, password: resetPasswordData.newPassword } 
            : u
        ));
        toast.success(`Password reset successfully for "${resettingUser.name}"! 🔐`);
      } else {
        // Backend expects POST with newPassword field
        await api.post(`/users/${resettingUser.id}/reset-password`, {
          newPassword: resetPasswordData.newPassword
        });
        toast.success(`Password reset successfully for "${resettingUser.name}"! 🔐`);
      }
      setOpenResetPasswordDialog(false);
      setResetPasswordData({ newPassword: '', confirmPassword: '' });
      setResettingUser(null);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to reset password';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const resetForm = () => {
    // Set default organization_id based on user role
    let defaultOrgId = '';
    if (user?.role === ROLES.ORG_ADMIN) {
      defaultOrgId = user.organization_id || '';
    }

    setFormData({
      name: '',
      email: '',
      password: '',
      role: ROLES.USER,
      organization_id: defaultOrgId,
      team_id: user?.role === ROLES.TEAM_LEAD ? (user.team_id || '') : '',
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
      organization_id: userData.organization_id || '',
      team_id: userData.team_id || '',
      is_active: userData.is_active
    });
    setOpenDialog(true);
  };

  // Get available roles based on current user's role
  const getAvailableRoles = () => {
    if (!user) return [];
    
    const allRoles = [
      { value: ROLES.SUPER_ADMIN, label: getRoleDisplayName(ROLES.SUPER_ADMIN) },
      { value: ROLES.ORG_ADMIN, label: getRoleDisplayName(ROLES.ORG_ADMIN) },
      { value: ROLES.TEAM_LEAD, label: getRoleDisplayName(ROLES.TEAM_LEAD) },
      { value: ROLES.USER, label: getRoleDisplayName(ROLES.USER) }
    ];

    // Filter roles based on what current user can create
    return allRoles.filter(role => canCreateRole(user, role.value));
  };

  // Get available teams based on current user's role
  const getAvailableTeams = () => {
    if (user?.role === ROLES.TEAM_LEAD) {
      // Team Lead can only assign to their own team
      return teams.filter(t => t.id === user.team_id);
    }
    return teams;
  };

  if (!canAccess(user, 'manage_org_users') && !canAccess(user, 'create_team_users')) {
    return <Alert severity="error">Access denied. You don't have permission to manage users.</Alert>;
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
              label={user?.role === ROLES.SUPER_ADMIN ? 'Super Admin' : user?.role === ROLES.ORG_ADMIN ? 'Org Admin' : 'Team Lead'}
              color={user?.role === ROLES.SUPER_ADMIN ? 'error' : user?.role === ROLES.ORG_ADMIN ? 'primary' : 'secondary'}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {user?.role === ROLES.SUPER_ADMIN 
              ? 'Create, edit, and manage all users across all organizations'
              : user?.role === ROLES.ORG_ADMIN
              ? 'Create, edit, and manage users, team leads, and teams within your organization'
              : 'Create and manage users in your team'}
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
              {user?.role === ROLES.SUPER_ADMIN && <TableCell>Organization</TableCell>}
              <TableCell>Team</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((u) => {
              const userTeam = teams.find(t => t.id === u.team_id);
              const userOrg = mockOrganizations.find(o => o.id === u.organization_id);
              return (
                <TableRow key={u.id} hover>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getRoleDisplayName(u.role)} 
                      color={getRoleColor(u.role)} 
                      size="small" 
                    />
                  </TableCell>
                  {user?.role === ROLES.SUPER_ADMIN && (
                    <TableCell>
                      {userOrg ? userOrg.name : '-'}
                    </TableCell>
                  )}
                  <TableCell>{userTeam ? userTeam.name : '-'}</TableCell>
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
                    {canResetPassword(user, u) && (
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenResetPasswordDialog(u)}
                        color="warning"
                        title="Reset Password"
                      >
                        <LockReset />
                      </IconButton>
                    )}
                    {(user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ORG_ADMIN) && (
                      <IconButton size="small" onClick={() => handleDelete(u.id)}>
                        <Delete />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          {users.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={user?.role === ROLES.SUPER_ADMIN ? 7 : 6}>
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
          {user?.role === ROLES.SUPER_ADMIN && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Organization</InputLabel>
              <Select
                value={formData.organization_id}
                label="Organization"
                onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
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
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {getAvailableRoles().map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Team</InputLabel>
            <Select
              value={formData.team_id}
              label="Team"
              onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
              disabled={user?.role === ROLES.TEAM_LEAD && formData.role === ROLES.USER}
            >
              <MenuItem value="">None</MenuItem>
              {getAvailableTeams().map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
            {user?.role === ROLES.TEAM_LEAD && formData.role === ROLES.USER && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                User will be automatically assigned to your team
              </Typography>
            )}
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

      {/* Reset Password Dialog */}
      <Dialog 
        open={openResetPasswordDialog} 
        onClose={() => {
          setOpenResetPasswordDialog(false);
          setResetPasswordData({ newPassword: '', confirmPassword: '' });
          setResettingUser(null);
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          Reset Password for {resettingUser?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter a new password for {resettingUser?.name} ({resettingUser?.email})
          </Typography>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={resetPasswordData.newPassword}
            onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
            margin="normal"
            required
            helperText="Password must be at least 6 characters long"
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={resetPasswordData.confirmPassword}
            onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
            margin="normal"
            required
            error={resetPasswordData.newPassword !== '' && resetPasswordData.confirmPassword !== '' && resetPasswordData.newPassword !== resetPasswordData.confirmPassword}
            helperText={
              resetPasswordData.newPassword !== '' && resetPasswordData.confirmPassword !== '' && resetPasswordData.newPassword !== resetPasswordData.confirmPassword
                ? 'Passwords do not match'
                : ''
            }
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenResetPasswordDialog(false);
              setResetPasswordData({ newPassword: '', confirmPassword: '' });
              setResettingUser(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResetPassword}
            variant="contained"
            color="warning"
            disabled={
              !resetPasswordData.newPassword || 
              !resetPasswordData.confirmPassword ||
              resetPasswordData.newPassword !== resetPasswordData.confirmPassword ||
              resetPasswordData.newPassword.length < 6
            }
          >
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
