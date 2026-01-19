import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Email,
  Phone,
  LocationOn,
  Business,
  Person,
  Work,
  School
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { mockUser, USE_MOCK_DATA, mockApi } from '../data/mockData';
import api from '../config/api';
import React from 'react';

const Profile = () => {
  const { user: authUser, updateUser } = useAuth();
  const user = USE_MOCK_DATA ? mockUser : (authUser || null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    department: '',
    specialty: '',
    designation: '',
    address: '',
    city: '',
    country: '',
    bio: '',
    skills: [],
    experience: '',
    education: ''
  });

  useEffect(() => {
    if (user) {
      // Load user profile data
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      if (USE_MOCK_DATA) {
        // Mock profile data
        const mockProfile = {
          name: user.name || 'John Doe',
          email: user.email || 'john.doe@example.com',
          role: user.role || 'USER',
          phone: '+1 234 567 8900',
          department: 'Engineering',
          specialty: 'Full Stack Development',
          designation: 'Senior Software Engineer',
          address: '123 Main Street',
          city: 'New York',
          country: 'United States',
          bio: 'Experienced software engineer with expertise in React, Node.js, and cloud technologies.',
          skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'MySQL'],
          experience: '5+ years',
          education: 'Bachelor of Science in Computer Science'
        };
        setProfileData(mockProfile);
      } else {
        // Backend returns: { data: {...} }
        // Use /users/:id/profile endpoint to get user profile
        const response = await api.get(`/users/${user.id}/profile`);
        const userData = response.data?.data || response.data;
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || '',
          phone: userData.phone || '',
          department: userData.department || '',
          specialty: userData.specialty || '',
          designation: userData.designation || '',
          address: userData.address || '',
          city: userData.city || '',
          country: userData.country || '',
          bio: userData.bio || '',
          skills: userData.skills || [],
          experience: userData.experience || '',
          education: userData.education || ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      if (USE_MOCK_DATA) {
        // Mock save
        toast.success('Profile updated successfully! ✅');
        setIsEditing(false);
      } else {
        // Backend returns: { data: {...}, message: '...' }
        // Use PUT /users/:id/profile endpoint for profile update
        const response = await api.put(`/users/${user.id}/profile`, profileData);
        const updatedUser = response.data?.data || response.data;
        toast.success('Profile updated successfully! ✅');
        setIsEditing(false);
        // Update auth context with new user data
        if (updatedUser && updateUser) {
          updateUser(updatedUser);
        }
        loadProfile(); // Reload to get updated data
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to update profile';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadProfile(); // Reset to original data
    setError('');
  };

  const departments = [
    'Engineering',
    'Product',
    'Design',
    'Marketing',
    'Sales',
    'Support',
    'Operations',
    'HR',
    'Finance',
    'Other'
  ];

  const specialties = [
    'Full Stack Development',
    'Frontend Development',
    'Backend Development',
    'DevOps',
    'UI/UX Design',
    'Product Management',
    'Data Science',
    'QA/Testing',
    'Project Management',
    'Other'
  ];

  if (loading && !profileData.name) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Alert severity="error">User not found. Please log in again.</Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          My Profile
        </Typography>
        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => setIsEditing(true)}
            sx={{ borderRadius: 2 }}
          >
            Edit Profile
          </Button>
        ) : (
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={20} /> : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Header Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
            <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                  fontWeight: 'bold'
                }}
              >
                {profileData.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {profileData.name || 'User Name'}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {profileData.designation || profileData.role}
                </Typography>
                <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                  <Chip
                    label={profileData.role}
                    color={profileData.role === 'ADMIN' ? 'primary' : 'default'}
                    size="small"
                  />
                  {profileData.department && (
                    <Chip
                      label={profileData.department}
                      icon={<Business />}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
              Personal Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  value={profileData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Work sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Professional Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              <Business sx={{ verticalAlign: 'middle', mr: 1 }} />
              Professional Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={profileData.department}
                    label="Department"
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  >
                    <MenuItem value="">Select Department</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Specialty</InputLabel>
                  <Select
                    value={profileData.specialty}
                    label="Specialty"
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                  >
                    <MenuItem value="">Select Specialty</MenuItem>
                    {specialties.map((spec) => (
                      <MenuItem key={spec} value={spec}>
                        {spec}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Experience"
                  value={profileData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., 5+ years"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Education"
                  value={profileData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <School sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  placeholder="e.g., Bachelor's Degree"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              <LocationOn sx={{ verticalAlign: 'middle', mr: 1 }} />
              Contact Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={profileData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  value={profileData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Bio & Additional Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Additional Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            <TextField
              fullWidth
              label="Bio"
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!isEditing}
              multiline
              rows={6}
              placeholder="Tell us about yourself..."
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
