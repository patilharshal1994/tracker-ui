import { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Typography
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Assignment,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import React from 'react';

const BulkActions = ({ selectedIds, onBulkUpdate, onBulkDelete, users = [] }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBulkStatusChange = () => {
    if (newStatus) {
      onBulkUpdate({ status: newStatus });
      setStatusDialogOpen(false);
      setNewStatus('');
      handleMenuClose();
    }
  };

  const handleBulkAssign = () => {
    onBulkUpdate({ assignee_id: assigneeId || null });
    setAssignDialogOpen(false);
    setAssigneeId('');
    handleMenuClose();
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} ticket(s)?`)) {
      onBulkDelete();
      handleMenuClose();
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1, mb: 2 }}>
        <Chip
          label={`${selectedIds.length} selected`}
          color="primary"
          sx={{ fontWeight: 'bold' }}
        />
        <Button
          size="small"
          startIcon={<MoreVert />}
          onClick={handleMenuOpen}
        >
          Bulk Actions
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => { setStatusDialogOpen(true); handleMenuClose(); }}>
            <CheckCircle sx={{ mr: 1 }} />
            Change Status
          </MenuItem>
          <MenuItem onClick={() => { setAssignDialogOpen(true); handleMenuClose(); }}>
            <Assignment sx={{ mr: 1 }} />
            Assign To
          </MenuItem>
          <MenuItem onClick={handleBulkDelete} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            Delete Selected
          </MenuItem>
        </Menu>
      </Box>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Change Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, minWidth: 200 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              label="New Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="CREATED">Created</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="DEPENDENCY">Dependency</MenuItem>
              <MenuItem value="HOLD">Hold</MenuItem>
              <MenuItem value="SOLVED">Solved</MenuItem>
              <MenuItem value="CLOSED">Closed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBulkStatusChange} variant="contained" disabled={!newStatus}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
        <DialogTitle>Assign Tickets</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, minWidth: 200 }}>
            <InputLabel>Assign To</InputLabel>
            <Select
              value={assigneeId}
              label="Assign To"
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBulkAssign} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkActions;
