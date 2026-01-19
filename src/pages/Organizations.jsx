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
  Avatar
} from '@mui/material';
import { Add, Edit, Delete, Business } from '@mui/icons-material';
import toast from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { mockOrganizations, mockUsers, USE_MOCK_DATA } from '../data/mockData';
import { ROLES, canAccess } from '../utils/roleHierarchy';
import React from 'react';

const Organizations = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      if (USE_MOCK_DATA) {
        setOrganizations(mockOrganizations);
      } else {
        const response = await api.get('/organizations');
        setOrganizations(response.data?.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate name
    const trimmedName = formData.name?.trim() || '';
    if (!trimmedName) {
      errors.name = 'Organization name is required';
      isValid = false;
    } else if (trimmedName.length < 2) {
      errors.name = 'Organization name must be at least 2 characters';
      isValid = false;
    } else if (trimmedName.length > 255) {
      errors.name = 'Organization name must be less than 255 characters';
      isValid = false;
    } else {
      // Check for duplicate name
      const duplicateOrg = organizations.find(
        o => o.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (duplicateOrg) {
        errors.name = 'Organization name already exists';
        isValid = false;
      }
    }

    // Validate description length
    if (formData.description && formData.description.length > 1000) {
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
      const orgData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined
      };

      if (USE_MOCK_DATA) {
        const newOrg = {
          id: organizations.length + 1,
          ...orgData,
          created_at: new Date().toISOString(),
          is_active: true
        };
        setOrganizations([...organizations, newOrg]);
        toast.success(`Organization "${formData.name}" created successfully! 🏢`);
      } else {
        const response = await api.post('/organizations', orgData);
        const createdOrg = response.data?.data || response.data;
        toast.success(`Organization "${createdOrg.name || formData.name}" created successfully! 🏢`);
        fetchOrganizations();
      }
      setOpenDialog(false);
      setFormData({ name: '', description: '' });
      setFormErrors({ name: '', description: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to create organization';
      // Check if it's a duplicate name error
      if (errorMsg.toLowerCase().includes('already exists')) {
        setFormErrors({ name: errorMsg, description: '' });
      } else {
        setError(errorMsg);
      }
      toast.error(errorMsg);
    }
  };

  const getOrgUserCount = (orgId) => {
    return mockUsers.filter(u => u.organization_id === orgId).length;
  };

  const getOrgTeamCount = (orgId) => {
    // This would come from API in real implementation
    return orgId === 1 ? 2 : 1;
  };

  if (!canAccess(user, 'manage_organizations')) {
    return (
      <Alert severity="error">
        You don't have permission to access this page. Only Super Admins can manage organizations.
      </Alert>
    );
  }

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
          <Typography variant="h4">Organizations</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all organizations in the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          New Organization
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
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Users</strong></TableCell>
              <TableCell><strong>Teams</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No organizations found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org) => (
                <TableRow key={org.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <Business fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" fontWeight="medium">
                        {org.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {org.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={getOrgUserCount(org.id)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={getOrgTeamCount(org.id)} size="small" color="secondary" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={org.is_active ? 'Active' : 'Inactive'}
                      color={org.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setFormData({ name: '', description: '' });
          setFormErrors({ name: '', description: '' });
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Create New Organization</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Organization Name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setFormErrors({ ...formErrors, name: '' });
            }}
            onBlur={() => {
              const trimmedName = formData.name?.trim() || '';
              if (trimmedName && trimmedName.length < 2) {
                setFormErrors({ ...formErrors, name: 'Organization name must be at least 2 characters' });
              } else if (trimmedName && trimmedName.length > 255) {
                setFormErrors({ ...formErrors, name: 'Organization name must be less than 255 characters' });
              }
            }}
            margin="normal"
            required
            error={!!formErrors.name}
            helperText={formErrors.name}
            inputProps={{ maxLength: 255 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              if (formErrors.description) {
                setFormErrors({ ...formErrors, description: '' });
              }
            }}
            margin="normal"
            multiline
            rows={3}
            error={!!formErrors.description}
            helperText={formErrors.description}
            inputProps={{ maxLength: 1000 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!formData.name?.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Organizations;
