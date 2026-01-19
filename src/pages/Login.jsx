import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider
} from '@mui/material';
import { ExpandMore, AdminPanelSettings, Business, Group, Person } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { mockUsers, mockOrganizations, USE_MOCK_DATA } from '../data/mockData';
import { getRoleDisplayName, getRoleColor, ROLES } from '../utils/roleHierarchy';
import logo from '../assets/logo.png';
import React from 'react'

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.user?.name || 'User'}! 🎉`, {
        duration: 4000,
        style: {
          fontSize: '16px',
          padding: '20px',
        },
      });
      navigate('/dashboard');
    } else {
      setError(result.error);
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                height: 60,
                width: 60,
                borderRadius: '10px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                mb: 2
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{
                  height: '120%',
                  width: '120%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block'
                }}
              />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 600 }}>
              Issue Tracker
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </form>

          {USE_MOCK_DATA && (
            <Accordion sx={{ mt: 3 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="body2" fontWeight="medium">
                  Demo Accounts (Click to expand)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    Password for all accounts: <strong>password123</strong>
                  </Typography>
                  
                  {/* Super Admin */}
                  {mockUsers.filter(u => u.role === ROLES.SUPER_ADMIN).map(user => (
                    <Box key={user.id} sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <AdminPanelSettings color="error" />
                        <Typography variant="body2" fontWeight="bold">
                          {user.name}
                        </Typography>
                        <Chip
                          label={getRoleDisplayName(user.role)}
                          size="small"
                          color={getRoleColor(user.role)}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Email: {user.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Access: All Organizations
                      </Typography>
                    </Box>
                  ))}

                  <Divider sx={{ my: 2 }} />

                  {/* Organization Admins */}
                  {mockUsers.filter(u => u.role === ROLES.ORG_ADMIN).map(user => {
                    const org = mockOrganizations.find(o => o.id === user.organization_id);
                    return (
                      <Box key={user.id} sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Business color="primary" />
                          <Typography variant="body2" fontWeight="bold">
                            {user.name}
                          </Typography>
                          <Chip
                            label={getRoleDisplayName(user.role)}
                            size="small"
                            color={getRoleColor(user.role)}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Email: {user.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Organization: {org?.name || 'Unknown'}
                        </Typography>
                      </Box>
                    );
                  })}

                  <Divider sx={{ my: 2 }} />

                  {/* Team Leads */}
                  {mockUsers.filter(u => u.role === ROLES.TEAM_LEAD).map(user => {
                    const org = mockOrganizations.find(o => o.id === user.organization_id);
                    return (
                      <Box key={user.id} sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Group color="secondary" />
                          <Typography variant="body2" fontWeight="bold">
                            {user.name}
                          </Typography>
                          <Chip
                            label={getRoleDisplayName(user.role)}
                            size="small"
                            color={getRoleColor(user.role)}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Email: {user.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Organization: {org?.name || 'Unknown'}
                        </Typography>
                      </Box>
                    );
                  })}

                  <Divider sx={{ my: 2 }} />

                  {/* Regular Users */}
                  {mockUsers.filter(u => u.role === ROLES.USER).map(user => {
                    const org = mockOrganizations.find(o => o.id === user.organization_id);
                    return (
                      <Box key={user.id} sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Person color="action" />
                          <Typography variant="body2" fontWeight="bold">
                            {user.name}
                          </Typography>
                          <Chip
                            label={getRoleDisplayName(user.role)}
                            size="small"
                            color={getRoleColor(user.role)}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Email: {user.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Organization: {org?.name || 'Unknown'}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
