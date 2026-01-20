import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import api from '../config/api';
import React from 'react';

const TicketActivityLog = ({ ticketId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ticketId) {
      fetchActivities();
    }
  }, [ticketId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      // Backend returns: { data: [...] }
      const response = await api.get(`/activities/tickets/${ticketId}`);
      setActivities(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType) => {
    const icons = {
      created: '🎫',
      status_changed: '🔄',
      assignee_changed: '👤',
      priority_changed: '⚡',
      comment_added: '💬',
      attachment_added: '📎'
    };
    return icons[actionType] || '📝';
  };

  const getActionColor = (actionType) => {
    const colors = {
      created: 'primary',
      status_changed: 'info',
      assignee_changed: 'warning',
      priority_changed: 'error',
      comment_added: 'success',
      attachment_added: 'secondary'
    };
    return colors[actionType] || 'default';
  };

  const formatActivityDescription = (activity) => {
    if (activity.description) {
      return activity.description;
    }

    const actionMap = {
      created: 'created this ticket',
      status_changed: `changed status from "${activity.old_value}" to "${activity.new_value}"`,
      assignee_changed: `assigned to ${activity.new_value}`,
      priority_changed: `changed priority from "${activity.old_value}" to "${activity.new_value}"`,
      comment_added: 'added a comment'
    };

    return actionMap[activity.action_type] || activity.action_type.replace('_', ' ');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (activities.length === 0) {
    return (
      <Box p={2}>
        <Typography variant="body2" color="text.secondary">
          No activity recorded yet
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Activity Log
      </Typography>
      <Box sx={{ mt: 2 }}>
        {activities.map((activity, index) => (
          <Box key={activity.id}>
            <Box display="flex" gap={2}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: `${getActionColor(activity.action_type)}.main`,
                    fontSize: '1.2rem',
                    mb: 1
                  }}
                >
                  {getActionIcon(activity.action_type)}
                </Avatar>
                {index < activities.length - 1 && (
                  <Box
                    sx={{
                      width: 2,
                      flex: 1,
                      bgcolor: 'divider',
                      minHeight: 40
                    }}
                  />
                )}
              </Box>
              <Box flex={1} sx={{ pb: index < activities.length - 1 ? 3 : 0 }}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                    {activity.user_name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" fontWeight="bold">
                    {activity.user_name}
                  </Typography>
                  <Chip
                    label={activity.action_type.replace('_', ' ')}
                    size="small"
                    color={getActionColor(activity.action_type)}
                    sx={{ textTransform: 'capitalize', height: 20, fontWeight: 500 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {formatActivityDescription(activity)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </Typography>
              </Box>
            </Box>
            {index < activities.length - 1 && (
              <Divider sx={{ my: 2, ml: 5 }} />
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default TicketActivityLog;
