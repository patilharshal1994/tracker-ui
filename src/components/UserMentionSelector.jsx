import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search, Person } from '@mui/icons-material';
import React from 'react';

const UserMentionSelector = ({ 
  open, 
  anchorEl, 
  users = [], 
  onSelect, 
  onClose,
  searchQuery = '' 
}) => {
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const listRef = useRef(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  if (!open || !anchorEl) return null;

  const anchorRect = anchorEl.getBoundingClientRect();
  const maxHeight = 300;
  const maxWidth = 350;

  return (
    <Paper
      ref={listRef}
      sx={{
        position: 'fixed',
        top: anchorRect.bottom + 5,
        left: anchorRect.left,
        width: maxWidth,
        maxHeight: maxHeight,
        zIndex: 9999,
        boxShadow: 6,
        borderRadius: 2,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider'
      }}
      onMouseDown={(e) => e.preventDefault()} // Prevent editor from losing focus
    >
      <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            )
          }}
          autoFocus
        />
      </Box>
      <List
        sx={{
          maxHeight: maxHeight - 60,
          overflowY: 'auto',
          p: 0
        }}
      >
        {filteredUsers.length === 0 ? (
          <ListItem>
            <ListItemText>
              <Typography variant="body2" color="text.secondary" align="center">
                No users found
              </Typography>
            </ListItemText>
          </ListItem>
        ) : (
          filteredUsers.map((user) => (
            <ListItem
              key={user.id}
              button
              onClick={() => {
                onSelect(user);
                onClose();
              }}
              sx={{
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={user.name}
                secondary={user.email}
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
};

export default UserMentionSelector;
