import { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Chip,
  Typography,
  Divider
} from '@mui/material';
import { AdminPanelSettings, Person } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { mockUsers, USE_MOCK_DATA } from '../data/mockData';
import React from 'react';

const RoleSwitcher = () => {
  const { user, updateUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  if (!USE_MOCK_DATA) return null;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const switchRole = (newUser) => {
    updateUser(newUser);
    handleClose();
    window.location.reload(); // Reload to update all role-based content
  };

  const adminUser = mockUsers.find(u => u.role === 'ADMIN');
  const regularUsers = mockUsers.filter(u => u.role === 'USER');

  return (
    <Box>
      <Button
        size="small"
        variant="outlined"
        onClick={handleClick}
        sx={{ 
          textTransform: 'none',
          borderColor: 'primary.main',
          '&:hover': {
            borderColor: 'primary.dark',
            bgcolor: 'primary.50'
          }
        }}
      >
        <Chip
          label={user?.role || 'USER'}
          size="small"
          color={user?.role === 'ADMIN' ? 'primary' : 'default'}
          sx={{ mr: 1, height: 20 }}
        />
        Switch Role
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { minWidth: 200, mt: 1 }
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ px: 1.5 }}>
            DEMO: Switch User Role
          </Typography>
        </Box>
        <Divider />
        {adminUser && (
          <MenuItem
            onClick={() => switchRole(adminUser)}
            selected={user?.id === adminUser.id}
          >
            <AdminPanelSettings sx={{ mr: 1, fontSize: 18 }} />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {adminUser.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ADMIN - Full Access
              </Typography>
            </Box>
          </MenuItem>
        )}
        {regularUsers.map((regularUser) => (
          <MenuItem
            key={regularUser.id}
            onClick={() => switchRole(regularUser)}
            selected={user?.id === regularUser.id}
          >
            <Person sx={{ mr: 1, fontSize: 18 }} />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {regularUser.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                USER - Limited Access
              </Typography>
            </Box>
          </MenuItem>
        ))}
        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            This switcher is only available in demo mode
          </Typography>
        </Box>
      </Menu>
    </Box>
  );
};

export default RoleSwitcher;
