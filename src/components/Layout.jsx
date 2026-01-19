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
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  Brightness4,
  Brightness7,
  Palette,
  Business
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { Chip, IconButton, Tooltip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { mockUser, USE_MOCK_DATA } from '../data/mockData';
import { getMenuItems, getRoleDisplayName, getRoleColor, ROLES } from '../utils/roleHierarchy';
import NotificationCenter from './NotificationCenter';
import React, { useEffect, useRef, useState } from 'react'
const drawerWidth = 240;
const collapsedDrawerWidth = 64;

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const user = USE_MOCK_DATA ? mockUser : (auth?.user || null);
  const logout = auth?.logout || (() => {});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [themeMenuAnchor, setThemeMenuAnchor] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const hasWelcomed = useRef(false);
  const { mode, colorScheme, toggleMode, setColorScheme, colorSchemes } = useTheme();

  // Show welcome message on first load
  useEffect(() => {
    if (user && !hasWelcomed.current && location.pathname !== '/login') {
      hasWelcomed.current = true;
      // setTimeout(() => {
      //   toast.success(`Welcome, ${user.name}! 👋`, {
      //     duration: 4000,
      //     style: {
      //       fontSize: '16px',
      //       padding: '20px',
      //     },
      //   });
      // }, 500);
    }
  }, [user, location.pathname]);

  // Map icon names to components
  const iconMap = {
    Dashboard: <Dashboard />,
    Folder: <Folder />,
    Assignment: <Assignment />,
    People: <People />,
    Groups: <Groups />,
    Business: <Business />
  };

  // Get menu items based on role hierarchy
  const menuItemsData = user ? getMenuItems(user) : [];
  const menuItems = menuItemsData.map(item => ({
    ...item,
    icon: iconMap[item.icon] || <Dashboard />
  }));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeMenuClick = (event) => {
    setThemeMenuAnchor(event.currentTarget);
  };

  const handleThemeMenuClose = () => {
    setThemeMenuAnchor(null);
  };

  const handleColorSchemeChange = (scheme) => {
    setColorScheme(scheme);
    handleThemeMenuClose();
    const displayName = scheme === 'tiktok' ? 'TikTok' : scheme === 'salla' ? 'Salla' : scheme.charAt(0).toUpperCase() + scheme.slice(1);
    toast.success(`Theme changed to ${displayName}! 🎨`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '64px !important'
        }}
      >
        {!collapsed && (
          <Typography variant="h6" noWrap component="div">
            Issue Tracker
          </Typography>
        )}
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{ 
            color: 'white',
            display: { xs: 'none', sm: 'flex' }
          }}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Toolbar>
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          const listItem = (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  px: collapsed ? 1.5 : 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light'
                    }
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isSelected ? 'primary.main' : 'inherit',
                    minWidth: collapsed ? 0 : 56,
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          );

          return collapsed ? (
            <Tooltip key={item.text} title={item.text} placement="right" arrow>
              {listItem}
            </Tooltip>
          ) : (
            listItem
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { 
            sm: collapsed 
              ? `calc(100% - ${collapsedDrawerWidth}px)` 
              : `calc(100% - ${drawerWidth}px)` 
          },
          ml: { 
            sm: collapsed 
              ? `${collapsedDrawerWidth}px` 
              : `${drawerWidth}px` 
          },
          transition: 'width 0.3s, margin 0.3s'
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
            
            {/* Theme Toggle */}
            <Tooltip title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
              <IconButton
                onClick={toggleMode}
                sx={{ 
                  color: 'inherit',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
              </IconButton>
            </Tooltip>

            {/* Color Scheme Menu */}
            <Tooltip title="Change Color Scheme">
              <IconButton
                onClick={handleThemeMenuClick}
                sx={{ 
                  color: 'inherit',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <Palette />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={themeMenuAnchor}
              open={Boolean(themeMenuAnchor)}
              onClose={handleThemeMenuClose}
              PaperProps={{
                sx: { minWidth: 180 }
              }}
            >
              <MenuItem disabled>
                <Typography variant="caption" color="text.secondary">Color Schemes</Typography>
              </MenuItem>
              <Divider />
              {colorSchemes.map((scheme) => {
                const displayName = scheme === 'tiktok' ? 'TikTok' : scheme === 'salla' ? 'Salla' : scheme.charAt(0).toUpperCase() + scheme.slice(1);
                return (
                  <MenuItem
                    key={scheme}
                    onClick={() => handleColorSchemeChange(scheme)}
                    selected={colorScheme === scheme}
                  >
                    <ListItemText>
                      {displayName}
                    </ListItemText>
                    {colorScheme === scheme && (
                      <ListItemIcon>
                        <Chip size="small" label="Active" color="primary" />
                      </ListItemIcon>
                    )}
                  </MenuItem>
                );
              })}
            </Menu>

            <Box sx={{ textAlign: 'right', mr: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                {user?.name}
              </Typography>
              <Chip
                label={user ? getRoleDisplayName(user.role) : 'USER'}
                size="small"
                color={user ? getRoleColor(user.role) : 'default'}
                sx={{ height: 18, fontSize: '0.65rem', mt: 0.5 }}
              />
            </Box>
            <Avatar
              sx={{
                bgcolor: user ? (user.role === ROLES.SUPER_ADMIN ? 'error.main' : user.role === ROLES.ORG_ADMIN ? 'primary.main' : user.role === ROLES.TEAM_LEAD ? 'secondary.main' : 'default') : 'default',
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
        sx={{ 
          width: { 
            sm: collapsed ? collapsedDrawerWidth : drawerWidth 
          }, 
          flexShrink: { sm: 0 },
          transition: 'width 0.3s'
        }}
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
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: collapsed ? collapsedDrawerWidth : drawerWidth,
              transition: 'width 0.3s',
              overflowX: 'hidden'
            }
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
          width: { 
            sm: collapsed 
              ? `calc(100% - ${collapsedDrawerWidth}px)` 
              : `calc(100% - ${drawerWidth}px)` 
          },
          mt: 8,
          transition: 'width 0.3s'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
