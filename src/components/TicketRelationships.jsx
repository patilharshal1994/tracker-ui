import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Autocomplete,
  TextField
} from '@mui/material';
import {
  Link as LinkIcon,
  Close,
  Block,
  ContentCopy,
  CallSplit
} from '@mui/icons-material';
import api from '../config/api';
import { encodeId } from '../utils/idEncoder';
import { useNavigate } from 'react-router-dom';
import React from 'react';

const TicketRelationships = ({ ticketId, relationships = [], onAdd, onRemove }) => {
  const [open, setOpen] = useState(false);
  const [relatedTicketId, setRelatedTicketId] = useState('');
  const [relationshipType, setRelationshipType] = useState('relates_to');
  const [availableTickets, setAvailableTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableTickets();
  }, [ticketId]);

  const fetchAvailableTickets = async () => {
    try {
      // Backend returns: { data: [...], pagination: {...} } or array directly
      const response = await api.get('/tickets');
      const ticketsData = response.data?.data || response.data || [];
      // Filter out current ticket (handle both UUID and integer IDs)
      const tickets = ticketsData.filter(t => t.id !== ticketId && t.id !== parseInt(ticketId));
      setAvailableTickets(tickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  const handleAdd = () => {
    if (relatedTicketId && relationshipType) {
      onAdd({
        ticket_id: parseInt(ticketId),
        related_ticket_id: parseInt(relatedTicketId),
        relationship_type: relationshipType
      });
      setRelatedTicketId('');
      setRelationshipType('relates_to');
      setOpen(false);
    }
  };

  const getRelationshipIcon = (type) => {
    const icons = {
      blocks: <Block />,
      blocked_by: <Block />,
      duplicates: <ContentCopy />,
      duplicate_of: <ContentCopy />,
      relates_to: <LinkIcon />,
      parent: <CallSplit />,
      child: <CallSplit />
    };
    return icons[type] || <LinkIcon />;
  };

  const getRelationshipLabel = (type) => {
    const labels = {
      blocks: 'Blocks',
      blocked_by: 'Blocked By',
      duplicates: 'Duplicates',
      duplicate_of: 'Duplicate Of',
      relates_to: 'Relates To',
      parent: 'Parent',
      child: 'Child'
    };
    return labels[type] || type;
  };

  const getRelationshipColor = (type) => {
    const colors = {
      blocks: 'error',
      blocked_by: 'warning',
      duplicates: 'info',
      duplicate_of: 'info',
      relates_to: 'default',
      parent: 'primary',
      child: 'secondary'
    };
    return colors[type] || 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Related Tickets
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<LinkIcon />}
          onClick={() => setOpen(true)}
        >
          Link Ticket
        </Button>
      </Box>

      {relationships.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No related tickets
          </Typography>
        </Paper>
      ) : (
        <List>
          {relationships.map((rel) => {
            const relatedTicket = availableTickets.find(t => t.id === rel.related_ticket_id);
            if (!relatedTicket) return null;

            return (
              <ListItem
                key={rel.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onRemove(rel.id)}
                    color="error"
                  >
                    <Close />
                  </IconButton>
                }
              >
                <Box sx={{ mr: 2, color: `${getRelationshipColor(rel.relationship_type)}.main` }}>
                  {getRelationshipIcon(rel.relationship_type)}
                </Box>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={getRelationshipLabel(rel.relationship_type)}
                        size="small"
                        color={getRelationshipColor(rel.relationship_type)}
                      />
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => navigate(`/tickets/${relatedTicket.id}`)}
                      >
                        #{relatedTicket.id}: {relatedTicket.title}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {relatedTicket.status} • {relatedTicket.priority}
                    </Typography>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Link Related Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              options={availableTickets}
              getOptionLabel={(option) => `#${option.id}: ${option.title}`}
              value={availableTickets.find(t => t.id === parseInt(relatedTicketId)) || null}
              onChange={(event, newValue) => {
                setRelatedTicketId(newValue ? newValue.id.toString() : '');
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Ticket" />
              )}
            />
            <FormControl fullWidth>
              <InputLabel>Relationship Type</InputLabel>
              <Select
                value={relationshipType}
                label="Relationship Type"
                onChange={(e) => setRelationshipType(e.target.value)}
              >
                <MenuItem value="relates_to">Relates To</MenuItem>
                <MenuItem value="blocks">Blocks</MenuItem>
                <MenuItem value="blocked_by">Blocked By</MenuItem>
                <MenuItem value="duplicates">Duplicates</MenuItem>
                <MenuItem value="duplicate_of">Duplicate Of</MenuItem>
                <MenuItem value="parent">Parent</MenuItem>
                <MenuItem value="child">Child</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" disabled={!relatedTicketId}>
            Link Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketRelationships;
