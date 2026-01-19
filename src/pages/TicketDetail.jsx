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
  Grid
} from '@mui/material';
import { Skeleton } from '@mui/material';
import { ArrowBack, Edit, AttachFile } from '@mui/icons-material';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { mockApi, USE_MOCK_DATA } from '../data/mockData';
import { decodeId } from '../utils/idEncoder';
import RichTextEditor from '../components/RichTextEditor';
import TicketActivityLog from '../components/TicketActivityLog';
import FileAttachment from '../components/FileAttachment';
import TicketRelationships from '../components/TicketRelationships';
import TimeTracker from '../components/TimeTracker';
import TicketWatchers from '../components/TicketWatchers';
import { TicketDetailSkeleton } from '../components/SkeletonLoader';
import { mockTags } from '../data/mockData';
import React from 'react';

const TicketDetail = () => {
  const { id: encodedId } = useParams();
  const ticketId = decodeId(encodedId);
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

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    } else {
      setError('Invalid ticket ID');
      setLoading(false);
    }
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      
      if (USE_MOCK_DATA) {
        const response = await mockApi.getTicket(ticketId);
        setTicket(response.data);
        setAttachments(response.data.attachments || []);
        setRelationships(response.data.relationships || []);
        setTimeLogs(response.data.time_logs || []);
        setWatchers(response.data.watchers || []);
        setEditData({
          status: response.data.status,
          priority: response.data.priority,
          assignee_id: response.data.assignee_id || ''
        });
      } else {
        const response = await api.get(`/tickets/${ticketId}`);
        setTicket(response.data);
        setAttachments(response.data.attachments || []);
        setRelationships(response.data.relationships || []);
        setTimeLogs(response.data.time_logs || []);
        setWatchers(response.data.watchers || []);
        setEditData({
          status: response.data.status,
          priority: response.data.priority,
          assignee_id: response.data.assignee_id || ''
        });
      }
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

      await api.post('/comments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setCommentText('');
      setCommentFile(null);
      fetchTicket();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add comment');
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/tickets/${ticketId}`, {
        ...editData,
        assignee_id: editData.assignee_id || null
      });
      setOpenEditDialog(false);
      fetchTicket();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update ticket');
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
                    const tag = mockTags.find(t => t.id === tagId);
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
                __html: ticket.description || '<p style="color: #999;">No description provided</p>'
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
                    bgcolor: 'grey.50', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'grey.100',
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
              <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
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
                  <RichTextEditor
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    label="Add a comment"
                    minHeight={120}
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
            </Paper>

            {/* Watchers */}
            <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 2, mb: 2 }}>
              <TicketWatchers
                ticketId={ticketId}
                watchers={watchers}
                onAddWatcher={(userId) => {
                  if (!watchers.includes(userId)) {
                    setWatchers([...watchers, userId]);
                  }
                }}
                onRemoveWatcher={(userId) => {
                  setWatchers(watchers.filter(id => id !== userId));
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
                }}
                onDeleteLog={(logId) => {
                  setTimeLogs(timeLogs.filter(log => log.id !== logId));
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">
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
              }}
              onRemove={(relId) => {
                setRelationships(relationships.filter(r => r.id !== relId));
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
