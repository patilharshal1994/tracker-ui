import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Autocomplete,
  TextField,
  Paper
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd,
  Close
} from '@mui/icons-material';
import { mockApi, mockUsers, USE_MOCK_DATA } from '../data/mockData';
import api from '../config/api';
import React from 'react';

const TicketWatchers = ({ ticketId, watchers = [], onAddWatcher, onRemoveWatcher }) => {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      if (USE_MOCK_DATA) {
        setAvailableUsers(mockUsers);
      } else {
        const response = await api.get('/users');
        setAvailableUsers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleAdd = () => {
    if (selectedUser) {
      onAddWatcher(selectedUser.id);
      setSelectedUser(null);
      setOpen(false);
    }
  };

  const watcherUsers = availableUsers.filter(u => watchers.includes(u.id));

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Watchers
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {watchers.length} {watchers.length === 1 ? 'person' : 'people'} watching this ticket
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={() => setOpen(true)}
          color="primary"
        >
          <PersonAdd />
        </IconButton>
      </Box>

      {watchers.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
          <VisibilityOff sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No watchers yet
          </Typography>
        </Paper>
      ) : (
        <Box display="flex" flexWrap="wrap" gap={1}>
          {watcherUsers.map((user) => (
            <Chip
              key={user.id}
              avatar={
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                  {user.name.charAt(0)}
                </Avatar>
              }
              label={user.name}
              onDelete={() => onRemoveWatcher(user.id)}
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Watcher</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              options={availableUsers.filter(u => !watchers.includes(u.id))}
              getOptionLabel={(option) => option.name}
              value={selectedUser}
              onChange={(event, newValue) => setSelectedUser(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Select User" />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: '0.875rem' }}>
                    {option.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">{option.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" disabled={!selectedUser}>
            Add Watcher
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketWatchers;
