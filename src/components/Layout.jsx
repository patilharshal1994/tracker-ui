import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge
} from '@mui/material';
import {
  Dashboard,
  Folder,
  Assignment,
  People,
  Groups,
  Logout,
  Menu as MenuIcon
} from '@mui/icons-material';
import { Chip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { mockUser, USE_MOCK_DATA } from '../data/mockData';
import NotificationCenter from './NotificationCenter';
import React from 'react'
const drawerWidth = 240;

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const user = USE_MOCK_DATA ? mockUser : (auth?.user || null);
  const logout = auth?.logout || (() => {});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Projects', icon: <Folder />, path: '/projects' },
    { text: 'Tickets', icon: <Assignment />, path: '/tickets' }
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push(
      { text: 'Users', icon: <People />, path: '/users' },
      { text: 'Teams', icon: <Groups />, path: '/teams' }
    );
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" noWrap component="div">
          Issue Tracker
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` }
        }}
      >
        <Toolbar>
          <MenuIcon
            sx={{ mr: 2, display: { sm: 'none' } }}
            onClick={handleDrawerToggle}
          />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find((item) => item.path === location.pathname)?.text || 'Issue Tracker'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user && <NotificationCenter />}
            <Box sx={{ textAlign: 'right', mr: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                {user?.name}
              </Typography>
              <Chip
                label={user?.role || 'USER'}
                size="small"
                color={user?.role === 'ADMIN' ? 'primary' : 'default'}
                sx={{ height: 18, fontSize: '0.65rem', mt: 0.5 }}
              />
            </Box>
            <Avatar
              sx={{ 
                bgcolor: user?.role === 'ADMIN' ? 'primary.main' : 'secondary.main', 
                cursor: 'pointer' 
              }}
              onClick={handleMenuClick}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
