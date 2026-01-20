import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
    Avatar,
    Grid,
    IconButton,
    Tooltip
} from '@mui/material';
import { Skeleton } from '@mui/material';
import { ArrowBack, Edit, AttachFile, ContentCopy, Share } from '@mui/icons-material';
import toast from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { decodeId, encodeId } from '../utils/idEncoder';
import { canAccess, ROLES } from '../utils/roleHierarchy';
import MentionableRichTextEditor from '../components/MentionableRichTextEditor';
import TicketActivityLog from '../components/TicketActivityLog';
import FileAttachment from '../components/FileAttachment';
import TicketRelationships from '../components/TicketRelationships';
import TimeTracker from '../components/TimeTracker';
import TicketWatchers from '../components/TicketWatchers';
import { TicketDetailSkeleton } from '../components/SkeletonLoader';
import React from 'react';

const TicketDetail = () => {
  const { id: encodedId } = useParams();
  // Try to decode ID if it's encoded, otherwise use as-is (for UUIDs)
  const ticketId = (() => {
    if (!encodedId) return null;
    
    // First, check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(encodedId)) {
      return encodedId; // It's a valid UUID
    }
    
    // If it contains hyphens but isn't a valid UUID, try removing hyphens and decoding as base64
    if (encodedId.includes('-')) {
      try {
        // Try decoding without hyphens
        const withoutHyphens = encodedId.replace(/-/g, '');
        const decoded = atob(withoutHyphens);
        // Check if decoded string looks like a UUID
        if (decoded.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          return decoded;
        }
      } catch (e) {
        // Not base64, continue
      }
    }
    
    // Try to decode it as base64 (might be base64 encoded UUID)
    try {
      const decoded = atob(encodedId);
      // Check if decoded string looks like a UUID
      if (decoded.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return decoded;
      }
      // If not a UUID, try the old integer decode method
      const id = parseInt(decoded, 10);
      if (!isNaN(id)) {
        return String(id);
      }
    } catch (e) {
      // Not base64, use as-is
    }
    
    // Use as-is (might be a UUID or other format - backend will validate)
    return encodedId;
  })();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentFile, setCommentFile] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editData, setEditData] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [watchers, setWatchers] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]); // Add tags state
  const [commentMentions, setCommentMentions] = useState([]);

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
      fetchUsers();
      fetchTags();
    } else {
      setError('Invalid ticket ID');
      setLoading(false);
    }
  }, [ticketId]);

  const fetchUsers = async () => {
    try {
      // Backend returns: { data: [...], pagination: {...} }
      const response = await api.get('/users');
      setUsers(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const fetchTags = async () => {
    try {
      // Backend returns: { data: [...], pagination: {...} }
      const response = await api.get('/tags');
      setTags(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  };

  const fetchTicket = async () => {
    try {
      setLoading(true);
      
      // Backend returns: { data: {...} }
      const response = await api.get(`/tickets/${ticketId}`);
      const ticketData = response.data?.data || response.data;
      setTicket(ticketData);
      setAttachments(ticketData.attachments || []);
      setRelationships(ticketData.relationships || []);
      setTimeLogs(ticketData.timeLogs || ticketData.time_logs || []);
      setWatchers(ticketData.watchers || []);
      setEditData({
        status: ticketData.status,
        priority: ticketData.priority,
        assignee_id: ticketData.assignee_id || '',
        module: ticketData.module || ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const formData = new FormData();
      formData.append('ticket_id', ticketId);
      formData.append('comment_text', commentText);
      if (commentFile) {
        formData.append('attachment', commentFile);
      }
      if (commentMentions.length > 0) {
        formData.append('mentioned_users', JSON.stringify(commentMentions));
      }

      // Backend returns: { data: {...}, message: '...' }
      const response = await api.post('/comments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Comment added successfully! 💬');
      setCommentText('');
      setCommentFile(null);
      setCommentMentions([]);
      fetchTicket();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to add comment';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleUpdate = async () => {
    try {
      // Assignee is required for users who can assign tickets
      if (canAccess(user, 'assign_tickets') && !editData.assignee_id) {
        toast.error('Please select an assignee');
        return;
      }
      
      // Backend returns: { data: {...}, message: '...' }
      const response = await api.put(`/tickets/${ticketId}`, {
        ...editData,
        assignee_id: editData.assignee_id || null
      });
      toast.success('Ticket updated successfully! ✏️');
      setOpenEditDialog(false);
      fetchTicket();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to update ticket';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      CREATED: 'default',
      IN_PROGRESS: 'primary',
      DEPENDENCY: 'warning',
      HOLD: 'warning',
      SOLVED: 'success',
      CLOSED: 'default'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'success',
      MEDIUM: 'warning',
      HIGH: 'error'
    };
    return colors[priority] || 'default';
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" width={100} height={36} sx={{ mb: 2, borderRadius: 1 }} />
        <TicketDetailSkeleton />
      </Box>
    );
  }

  if (error && !ticket) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!ticket) return null;

  const canEdit = user.role === 'ADMIN' || ticket.reporter_id === user.id || ticket.assignee_id === user.id;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/tickets')} sx={{ mb: 2 }}>
        Back to Tickets
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 2, boxShadow: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {ticket.title}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Typography variant="body2" color="primary" fontWeight="medium">
                    #{ticket.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">•</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ticket.project_name || 'Unknown Project'}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" gap={1}>
                <Tooltip title="Copy ticket link">
                  <IconButton
                    onClick={() => {
                      const ticketUrl = `${window.location.origin}/tickets/${ticket.id}`;
                      navigator.clipboard.writeText(ticketUrl).then(() => {
                        toast.success('Ticket link copied to clipboard! 🔗', {
                          duration: 3000,
                        });
                      }).catch(() => {
                        toast.error('Failed to copy link');
                      });
                    }}
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider',
                      '&:hover': { 
                        bgcolor: 'primary.light',
                        borderColor: 'primary.main',
                        color: 'primary.main'
                      }
                    }}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
                {canEdit && (
                  <Button
                    startIcon={<Edit />}
                    onClick={() => setOpenEditDialog(true)}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  >
                    Edit
                  </Button>
                )}
              </Box>
            </Box>

            {ticket.is_breached && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  boxShadow: 1,
                  '& .MuiAlert-icon': { fontSize: 28 }
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  ⚠️ SLA Breach Alert
                </Typography>
                <Typography variant="body2">
                  This ticket has passed its due date and is marked as BREACHED
                </Typography>
              </Alert>
            )}

            <Box display="flex" gap={1} mb={2} flexWrap="wrap" alignItems="center">
              <Chip label={ticket.type} size="small" sx={{ fontWeight: 500 }} />
              <Chip label={ticket.status.replace('_', ' ')} color={getStatusColor(ticket.status)} size="small" sx={{ textTransform: 'capitalize', fontWeight: 500 }} />
              <Chip label={ticket.priority} color={getPriorityColor(ticket.priority)} size="small" sx={{ fontWeight: 500 }} />
              {ticket.tags && ticket.tags.length > 0 && (
                <>
                  {ticket.tags.map(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        sx={{
                          bgcolor: tag.color || 'primary.main',
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    ) : null;
                  })}
                </>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Box
              sx={{
                mb: 2,
                '& p': { margin: 0 },
                '& ul, & ol': { margin: '8px 0', paddingLeft: '24px' }
              }}
              dangerouslySetInnerHTML={{
                __html: ticket.description || '<p style="color: inherit; opacity: 0.7;">No description provided</p>'
              }}
            />

            {ticket.scenario && (
              <>
                <Typography variant="h6" gutterBottom>
                  Scenario
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {ticket.scenario}
                </Typography>
              </>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Attachments */}
            <Box sx={{ mb: 3 }}>
              <FileAttachment
                attachments={attachments}
                onUpload={(file) => setAttachments([...attachments, file])}
                onDelete={(fileId) => setAttachments(attachments.filter(a => a.id !== fileId))}
                readOnly={!canEdit}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Comments ({ticket.comments?.length || 0})
            </Typography>

            {ticket.comments && ticket.comments.length > 0 ? (
              ticket.comments.map((comment) => (
                <Box 
                  key={comment.id} 
                  sx={{ 
                    mb: 2, 
                    p: 2.5, 
                    bgcolor: (theme) => theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.02)', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.08)' 
                        : 'rgba(0, 0, 0, 0.04)',
                      boxShadow: 1
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" mb={1.5}>
                    <Avatar 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        mr: 1.5,
                        bgcolor: 'primary.main',
                        fontWeight: 'bold'
                      }}
                    >
                      {comment.user_name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {comment.user_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      ml: 7,
                      '& p': { margin: '8px 0' },
                      '& ul, & ol': { margin: '8px 0', paddingLeft: '24px' },
                      '& strong': { fontWeight: 600 }
                    }}
                    dangerouslySetInnerHTML={{
                      __html: comment.comment_text || ''
                    }}
                  />
                  {comment.attachment_url && (
                    <Box sx={{ ml: 7, mt: 1.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AttachFile />}
                        href={`http://localhost:3001${comment.attachment_url}`}
                        target="_blank"
                        sx={{ borderRadius: 2 }}
                      >
                        View Attachment
                      </Button>
                    </Box>
                  )}
                </Box>
              ))
            ) : (
              <Box sx={{ 
                p: 3, 
                textAlign: 'center', 
                bgcolor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.02)', 
                borderRadius: 2 
              }}>
                <Typography variant="body2" color="text.secondary">
                  No comments yet. Be the first to comment!
                </Typography>
              </Box>
            )}

            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                mt: 2,
                bgcolor: 'background.paper',
                borderRadius: 2
              }}
            >
              <form onSubmit={handleCommentSubmit}>
                <Box sx={{ mb: 1.5 }}>
                  <MentionableRichTextEditor
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onMentionsChange={(userIds) => setCommentMentions(userIds)}
                    label="Add a comment"
                    minHeight={120}
                    users={users}
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    startIcon={<AttachFile />}
                    sx={{ borderRadius: 2 }}
                  >
                    Attach Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setCommentFile(e.target.files[0])}
                    />
                  </Button>
                  {commentFile && (
                    <Chip
                      label={commentFile.name}
                      size="small"
                      onDelete={() => setCommentFile(null)}
                      sx={{ mr: 'auto', ml: 2 }}
                    />
                  )}
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={!commentText || commentText.trim() === '' || commentText === '<p></p>'}
                    sx={{ borderRadius: 2 }}
                  >
                    Post Comment
                  </Button>
                </Box>
              </form>
            </Paper>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 80, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
            <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="medium">
                  Reporter
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                    {ticket.reporter_name?.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" fontWeight="medium">{ticket.reporter_name}</Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="medium">
                  Assignee
                </Typography>
                {ticket.assignee_name ? (
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                      {ticket.assignee_name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" fontWeight="medium">{ticket.assignee_name}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Unassigned</Typography>
                )}
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body2">
                  {new Date(ticket.created_at).toLocaleString()}
                </Typography>
              </Box>
              {ticket.due_date && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Due Date
                  </Typography>
                  <Typography variant="body2">
                    {new Date(ticket.due_date).toLocaleString()}
                  </Typography>
                </Box>
              )}
              {ticket.branch_name && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Branch
                  </Typography>
                  <Typography variant="body2">{ticket.branch_name}</Typography>
                </Box>
              )}
              {ticket.module && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="medium">
                    Module
                  </Typography>
                  <Chip 
                    label={ticket.module.replace('_', ' ')} 
                    size="small" 
                    sx={{ mt: 0.5, textTransform: 'capitalize' }}
                    color="info"
                  />
                </Box>
              )}
            </Paper>

            {/* Watchers */}
            <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 2, mb: 2 }}>
              <TicketWatchers
                ticketId={ticketId}
                watchers={watchers}
              onAddWatcher={(userId) => {
                if (!watchers.includes(userId)) {
                  setWatchers([...watchers, userId]);
                  toast.success('Watcher added successfully! 👀');
                }
              }}
              onRemoveWatcher={(userId) => {
                setWatchers(watchers.filter(id => id !== userId));
                toast.success('Watcher removed successfully! 🗑️');
              }}
              />
            </Paper>

            {/* Time Tracking */}
            <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
              <TimeTracker
                ticketId={ticketId}
                timeLogs={timeLogs}
              onLogTime={(log) => {
                const newLog = {
                  id: Date.now(),
                  ...log,
                  user_id: user.id,
                  user_name: user.name
                };
                setTimeLogs([...timeLogs, newLog]);
                toast.success(`${log.hours} hours logged successfully! ⏱️`);
              }}
              onDeleteLog={(logId) => {
                setTimeLogs(timeLogs.filter(log => log.id !== logId));
                toast.success('Time log deleted successfully! 🗑️');
              }}
              />
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Ticket</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={editData.status}
              label="Status"
              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
            >
              <MenuItem value="CREATED">Created</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="DEPENDENCY">Dependency</MenuItem>
              <MenuItem value="HOLD">Hold</MenuItem>
              <MenuItem value="SOLVED">Solved</MenuItem>
              <MenuItem value="CLOSED">Closed</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              value={editData.priority}
              label="Priority"
              onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Module</InputLabel>
            <Select
              value={editData.module || ''}
              label="Module"
              onChange={(e) => setEditData({ ...editData, module: e.target.value })}
            >
              <MenuItem value="">Select Module</MenuItem>
              <MenuItem value="AUTHENTICATION">Authentication</MenuItem>
              <MenuItem value="USER_MANAGEMENT">User Management</MenuItem>
              <MenuItem value="DASHBOARD">Dashboard</MenuItem>
              <MenuItem value="REPORTING">Reporting</MenuItem>
              <MenuItem value="INTEGRATION">Integration</MenuItem>
              <MenuItem value="API">API</MenuItem>
              <MenuItem value="DATABASE">Database</MenuItem>
              <MenuItem value="FRONTEND">Frontend</MenuItem>
              <MenuItem value="BACKEND">Backend</MenuItem>
              <MenuItem value="UI_UX">UI/UX</MenuItem>
              <MenuItem value="SECURITY">Security</MenuItem>
              <MenuItem value="PERFORMANCE">Performance</MenuItem>
              <MenuItem value="TESTING">Testing</MenuItem>
              <MenuItem value="DEPLOYMENT">Deployment</MenuItem>
              <MenuItem value="DOCUMENTATION">Documentation</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>
          {canAccess(user, 'assign_tickets') && (
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Assignee</InputLabel>
              <Select
                value={editData.assignee_id || ''}
                label="Assignee"
                onChange={(e) => setEditData({ ...editData, assignee_id: e.target.value || null })}
                required
              >
                <MenuItem value="">Select Assignee</MenuItem>
                {users
                  .filter(u => {
                    // Filter users based on role permissions
                    if (user.role === ROLES.SUPER_ADMIN) {
                      return true; // Super Admin can assign to anyone
                    } else if (user.role === ROLES.ORG_ADMIN) {
                      return u.organization_id === user.organization_id; // Org Admin can assign to users in their org
                    } else if (user.role === ROLES.TEAM_LEAD) {
                      return u.team_id === user.team_id; // Team Lead can assign to users in their team
                    }
                    return false;
                  })
                  .map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name} {u.email ? `(${u.email})` : ''}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdate} 
            variant="contained"
            disabled={canAccess(user, 'assign_tickets') && !editData.assignee_id}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ticket Relationships and Activity Log */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
            <TicketRelationships
              ticketId={ticketId}
              relationships={relationships}
              onAdd={(rel) => {
                const newRel = {
                  id: Date.now(),
                  ...rel,
                  related_ticket: { id: rel.related_ticket_id }
                };
                setRelationships([...relationships, newRel]);
                toast.success('Ticket relationship added successfully! 🔗');
              }}
              onRemove={(relId) => {
                setRelationships(relationships.filter(r => r.id !== relId));
                toast.success('Ticket relationship removed successfully! 🗑️');
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <TicketActivityLog ticketId={ticketId} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TicketDetail;
