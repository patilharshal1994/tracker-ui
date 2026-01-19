import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add,
  Delete,
  AccessTime,
  Edit
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';

const TimeTracker = ({ ticketId, timeLogs = [], onLogTime, onDeleteLog }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    hours: '',
    description: '',
    logged_date: new Date().toISOString().split('T')[0]
  });

  const totalHours = timeLogs.reduce((sum, log) => sum + parseFloat(log.hours || 0), 0);

  const handleSubmit = () => {
    if (formData.hours && parseFloat(formData.hours) > 0) {
      onLogTime({
        ticket_id: ticketId,
        hours: parseFloat(formData.hours),
        description: formData.description,
        logged_date: formData.logged_date
      });
      setFormData({
        hours: '',
        description: '',
        logged_date: new Date().toISOString().split('T')[0]
      });
      setOpen(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Time Tracking
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total: <strong>{totalHours.toFixed(2)} hours</strong>
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Log Time
        </Button>
      </Box>

      {timeLogs.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <AccessTime sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No time logged yet
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ 
                bgcolor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.02)' 
              }}>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Hours</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Logged By</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timeLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    {new Date(log.logged_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip label={`${log.hours}h`} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {log.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {log.user_name || 'Unknown'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDeleteLog(log.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Time</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Hours"
              type="number"
              inputProps={{ min: 0, step: 0.25 }}
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              required
              helperText="Enter time in hours (e.g., 2.5 for 2 hours 30 minutes)"
            />
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.logged_date}
              onChange={(e) => setFormData({ ...formData, logged_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What did you work on?"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.hours || parseFloat(formData.hours) <= 0}
          >
            Log Time
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeTracker;
