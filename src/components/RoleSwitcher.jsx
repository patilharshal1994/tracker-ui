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
import { AdminPanelSettings, Person, Business, Group } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { mockUsers, mockOrganizations, USE_MOCK_DATA } from '../data/mockData';
import { getRoleDisplayName, getRoleColor, ROLES } from '../utils/roleHierarchy';
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

  const getRoleIcon = (role) => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return <AdminPanelSettings sx={{ mr: 1, fontSize: 18 }} />;
      case ROLES.ORG_ADMIN:
        return <Business sx={{ mr: 1, fontSize: 18 }} />;
      case ROLES.TEAM_LEAD:
        return <Group sx={{ mr: 1, fontSize: 18 }} />;
      default:
        return <Person sx={{ mr: 1, fontSize: 18 }} />;
    }
  };

  const getOrganizationName = (orgId) => {
    if (!orgId) return 'All Organizations';
    const org = mockOrganizations.find(o => o.id === orgId);
    return org ? org.name : 'Unknown';
  };

  // Group users by role
  const superAdmin = mockUsers.find(u => u.role === ROLES.SUPER_ADMIN);
  const orgAdmins = mockUsers.filter(u => u.role === ROLES.ORG_ADMIN);
  const teamLeads = mockUsers.filter(u => u.role === ROLES.TEAM_LEAD);
  const regularUsers = mockUsers.filter(u => u.role === ROLES.USER);

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
          label={user ? getRoleDisplayName(user.role) : 'USER'}
          size="small"
          color={user ? getRoleColor(user.role) : 'default'}
          sx={{ mr: 1, height: 20 }}
        />
        Switch Role
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { minWidth: 280, mt: 1, maxHeight: 500, overflow: 'auto' }
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ px: 1.5 }}>
            DEMO: Switch User Role
          </Typography>
        </Box>
        <Divider />
        
        {/* Super Admin */}
        {superAdmin && (
          <MenuItem
            onClick={() => switchRole(superAdmin)}
            selected={user?.id === superAdmin.id}
          >
            {getRoleIcon(superAdmin.role)}
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {superAdmin.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getRoleDisplayName(superAdmin.role)} - All Organizations
              </Typography>
            </Box>
          </MenuItem>
        )}

        {/* Organization Admins */}
        {orgAdmins.length > 0 && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <Box sx={{ px: 1.5, py: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                Organization Admins
              </Typography>
            </Box>
            {orgAdmins.map((orgAdmin) => (
              <MenuItem
                key={orgAdmin.id}
                onClick={() => switchRole(orgAdmin)}
                selected={user?.id === orgAdmin.id}
              >
                {getRoleIcon(orgAdmin.role)}
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {orgAdmin.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getRoleDisplayName(orgAdmin.role)} - {getOrganizationName(orgAdmin.organization_id)}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </>
        )}

        {/* Team Leads */}
        {teamLeads.length > 0 && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <Box sx={{ px: 1.5, py: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                Team Leads
              </Typography>
            </Box>
            {teamLeads.map((teamLead) => (
              <MenuItem
                key={teamLead.id}
                onClick={() => switchRole(teamLead)}
                selected={user?.id === teamLead.id}
              >
                {getRoleIcon(teamLead.role)}
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {teamLead.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getRoleDisplayName(teamLead.role)} - {getOrganizationName(teamLead.organization_id)}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </>
        )}

        {/* Regular Users */}
        {regularUsers.length > 0 && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <Box sx={{ px: 1.5, py: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                Users
              </Typography>
            </Box>
            {regularUsers.map((regularUser) => (
              <MenuItem
                key={regularUser.id}
                onClick={() => switchRole(regularUser)}
                selected={user?.id === regularUser.id}
              >
                {getRoleIcon(regularUser.role)}
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {regularUser.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getRoleDisplayName(regularUser.role)} - {getOrganizationName(regularUser.organization_id)}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </>
        )}

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
