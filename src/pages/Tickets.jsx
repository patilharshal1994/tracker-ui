import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Collapse,
  InputAdornment,
  Pagination,
    TableFooter,
    Tooltip
  } from '@mui/material';
import { Add, Visibility, FilterList, Search, Clear, ExpandMore, ExpandLess, Description, ViewList, ViewModule, ContentCopy } from '@mui/icons-material';
import toast from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { mockApi, mockProjects, mockUsers, mockTags, USE_MOCK_DATA } from '../data/mockData';
import { encodeId } from '../utils/idEncoder';
import MentionableRichTextEditor from '../components/MentionableRichTextEditor';
import TagSelector from '../components/TagSelector';
import BulkActions from '../components/BulkActions';
import ExportButton from '../components/ExportButton';
import AdvancedSearch from '../components/AdvancedSearch';
import { TicketListSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { Checkbox, Avatar } from '@mui/material';
import { Tune } from '@mui/icons-material';
import React from 'react'
import TicketTemplate from '../components/TicketTemplate';
const Tickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: '',
    project_id: '',
    assignee_id: '',
    reporter_id: '',
    assigned_to_me: user.role === 'USER' ? 'true' : '',
    reported_by_me: '',
    is_breached: '',
    search: ''
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [projects, setProjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    project_id: '',
    type: 'TASK',
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignee_id: '',
    module: '',
    tags: [],
    mentioned_users: []
  });
  const [users, setUsers] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  useEffect(() => {
    fetchTickets();
    fetchProjects();
    fetchUsers(); // Fetch users for mentions (all users need this)
  }, [filters]);

  // Reset selectAll when page changes
  useEffect(() => {
    setSelectAll(false);
  }, [page]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Filter out empty values and search (which we'll handle separately)
      const params = Object.fromEntries(
        Object.entries(filters).filter(([key, v]) => v !== '' && key !== 'search')
      );
      
      let ticketsData = [];
      let paginationData = null;
      
      if (USE_MOCK_DATA) {
        const response = await mockApi.getTickets(params);
        ticketsData = response.data;
      } else {
        // Backend returns: { data: [...], pagination: {...} }
        const response = await api.get('/tickets', { params: { ...params, page, limit: rowsPerPage } });
        ticketsData = response.data?.data || [];
        paginationData = response.data?.pagination || null;
      }

      // Apply search filter if present
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        ticketsData = ticketsData.filter(ticket =>
          ticket.title.toLowerCase().includes(searchTerm) ||
          ticket.description?.toLowerCase().includes(searchTerm) ||
          ticket.project_name?.toLowerCase().includes(searchTerm)
        );
      }

      setTickets(ticketsData);
      setPage(1); // Reset to first page when filters change
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(tickets.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTickets = tickets.slice(startIndex, endIndex);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const fetchProjects = async () => {
    try {
      if (USE_MOCK_DATA) {
        const response = await mockApi.getProjects();
        setProjects(response.data);
      } else {
        // Backend returns: { data: [...], pagination: {...} }
        const response = await api.get('/projects');
        setProjects(response.data?.data || []);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      if (USE_MOCK_DATA) {
        const response = await mockApi.getUsers();
        setUsers(response.data);
      } else {
        // Backend returns: { data: [...], pagination: {...} }
        const response = await api.get('/users');
        setUsers(response.data?.data || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleCreate = async () => {
    try {
      // Backend expects: { data: {...} } format
      const response = await api.post('/tickets', {
        ...formData,
        assignee_id: formData.assignee_id || null,
        mentioned_users: formData.mentioned_users || []
      });
      
      // Backend returns: { data: {...}, message: '...' }
      const ticket = response.data?.data || response.data;
      toast.success(`Ticket "${ticket.title || formData.title}" created successfully! 🎫`);
      if (formData.mentioned_users && formData.mentioned_users.length > 0) {
        toast.success(`${formData.mentioned_users.length} user(s) tagged! 👥`);
      }
      setOpenDialog(false);
      setFormData({
        project_id: '',
        type: 'TASK',
        title: '',
        description: '',
        priority: 'MEDIUM',
        assignee_id: '',
        module: '',
        tags: [],
        mentioned_users: []
      });
      fetchTickets();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to create ticket';
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

  if (loading && tickets.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Typography variant="h4">Tickets</Typography>
            <Chip
              label={user.role}
              color={user.role === 'ADMIN' ? 'primary' : 'default'}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {user.role === 'ADMIN' 
              ? 'View and manage all tickets across all projects' 
              : 'View tickets assigned to you or reported by you'}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Tune />}
            onClick={() => setAdvancedSearchOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Advanced Search
          </Button>
          <Button
            variant="outlined"
            startIcon={<Description />}
            onClick={() => setTemplateDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Templates
          </Button>
          {tickets.length > 0 && (
            <ExportButton data={tickets} filename="tickets" />
          )}
          <Box display="flex" gap={0.5} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setViewMode('list')}
              color={viewMode === 'list' ? 'primary' : 'default'}
              sx={{ 
                bgcolor: viewMode === 'list' ? 'primary.light' : 'transparent',
                '&:hover': { bgcolor: viewMode === 'list' ? 'primary.light' : 'action.hover' }
              }}
            >
              <ViewList />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
              sx={{ 
                bgcolor: viewMode === 'grid' ? 'primary.light' : 'transparent',
                '&:hover': { bgcolor: viewMode === 'grid' ? 'primary.light' : 'action.hover' }
              }}
            >
              <ViewModule />
            </IconButton>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{ borderRadius: 2 }}
          >
            New Ticket
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2, boxShadow: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterList color="primary" />
            <Typography variant="h6" fontWeight="medium">
              Filters
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              size="small"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              endIcon={filtersExpanded ? <ExpandLess /> : <ExpandMore />}
            >
              {filtersExpanded ? 'Show Less' : 'More Filters'}
            </Button>
            {(Object.values(filters).some(v => v !== '' && v !== (user.role === 'USER' ? 'true' : ''))) && (
              <Button
                size="small"
                startIcon={<Clear />}
                onClick={() => {
                  setFilters({
                    status: '',
                    priority: '',
                    type: '',
                    project_id: '',
                    assignee_id: '',
                    reporter_id: '',
                    assigned_to_me: user.role === 'USER' ? 'true' : '',
                    reported_by_me: '',
                    is_breached: '',
                    search: ''
                  });
                }}
                color="error"
              >
                Clear All
              </Button>
            )}
          </Box>
        </Box>

        {/* Quick Filters - Always Visible */}
        <Grid container spacing={2} sx={{ mb: filtersExpanded ? 2 : 0 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search tickets..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="CREATED">Created</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="DEPENDENCY">Dependency</MenuItem>
                <MenuItem value="HOLD">Hold</MenuItem>
                <MenuItem value="SOLVED">Solved</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <MenuItem value="">All Priority</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="TASK">Task</MenuItem>
                <MenuItem value="BUG">Bug</MenuItem>
                <MenuItem value="ISSUE">Issue</MenuItem>
                <MenuItem value="SUGGESTION">Suggestion</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" gap={1} flexWrap="wrap">
              {user.role === 'USER' ? (
                <>
                  <Button
                    variant={filters.assigned_to_me === 'true' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        assigned_to_me: filters.assigned_to_me === 'true' ? '' : 'true',
                        reported_by_me: ''
                      })
                    }
                  >
                    Assigned to Me
                  </Button>
                  <Button
                    variant={filters.reported_by_me === 'true' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        reported_by_me: filters.reported_by_me === 'true' ? '' : 'true',
                        assigned_to_me: ''
                      })
                    }
                  >
                    Reported by Me
                  </Button>
                </>
              ) : (
                <Button
                  variant={filters.is_breached === 'true' ? 'contained' : 'outlined'}
                  size="small"
                  {...(filters.is_breached === 'true' && { color: 'error' })}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      is_breached: filters.is_breached === 'true' ? '' : 'true'
                    })
                  }
                >
                  Breached Only
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Advanced Filters - Collapsible */}
        <Collapse in={filtersExpanded}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Project</InputLabel>
                <Select
                  value={filters.project_id}
                  label="Project"
                  onChange={(e) => setFilters({ ...filters, project_id: e.target.value })}
                >
                  <MenuItem value="">All Projects</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {user.role === 'ADMIN' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Assignee</InputLabel>
                    <Select
                      value={filters.assignee_id}
                      label="Assignee"
                      onChange={(e) => setFilters({ ...filters, assignee_id: e.target.value })}
                    >
                      <MenuItem value="">All Assignees</MenuItem>
                      <MenuItem value="null">Unassigned</MenuItem>
                      {users.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Reporter</InputLabel>
                    <Select
                      value={filters.reporter_id}
                      label="Reporter"
                      onChange={(e) => setFilters({ ...filters, reporter_id: e.target.value })}
                    >
                      <MenuItem value="">All Reporters</MenuItem>
                      {users.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant={filters.is_breached === 'true' ? 'contained' : 'outlined'}
                    size="small"
                    {...(filters.is_breached === 'true' && { color: 'error' })}
                    fullWidth
                    onClick={() =>
                      setFilters({
                        ...filters,
                        is_breached: filters.is_breached === 'true' ? '' : 'true'
                      })
                    }
                  >
                    {filters.is_breached === 'true' ? '✓ Breached Only' : 'Show Breached'}
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </Collapse>

        {/* Active Filters Display */}
        {Object.entries(filters).some(([key, value]) => {
          if (key === 'search') return value !== '';
          if (key === 'assigned_to_me' && user.role === 'USER') return false;
          return value !== '';
        }) && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Active filters:
            </Typography>
            {filters.search && (
              <Chip
                label={`Search: "${filters.search}"`}
                size="small"
                onDelete={() => setFilters({ ...filters, search: '' })}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            )}
            {filters.status && (
              <Chip
                label={`Status: ${filters.status}`}
                size="small"
                onDelete={() => setFilters({ ...filters, status: '' })}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            )}
            {filters.priority && (
              <Chip
                label={`Priority: ${filters.priority}`}
                size="small"
                onDelete={() => setFilters({ ...filters, priority: '' })}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            )}
            {filters.type && (
              <Chip
                label={`Type: ${filters.type}`}
                size="small"
                onDelete={() => setFilters({ ...filters, type: '' })}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            )}
            {filters.project_id && (
              <Chip
                label={`Project: ${projects.find(p => p.id === parseInt(filters.project_id))?.name || filters.project_id}`}
                size="small"
                onDelete={() => setFilters({ ...filters, project_id: '' })}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            )}
            {filters.assignee_id && (
              <Chip
                label={`Assignee: ${users.find(u => u.id === parseInt(filters.assignee_id))?.name || filters.assignee_id}`}
                size="small"
                onDelete={() => setFilters({ ...filters, assignee_id: '' })}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            )}
            {filters.reporter_id && (
              <Chip
                label={`Reporter: ${users.find(u => u.id === parseInt(filters.reporter_id))?.name || filters.reporter_id}`}
                size="small"
                onDelete={() => setFilters({ ...filters, reporter_id: '' })}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            )}
            {filters.is_breached === 'true' && (
              <Chip
                label="Breached Only"
                size="small"
                color="error"
                onDelete={() => setFilters({ ...filters, is_breached: '' })}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            )}
            {filters.assigned_to_me === 'true' && (
              <Chip
                label="Assigned to Me"
                size="small"
                onDelete={() => setFilters({ ...filters, assigned_to_me: '' })}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            )}
            {filters.reported_by_me === 'true' && (
              <Chip
                label="Reported by Me"
                size="small"
                onDelete={() => setFilters({ ...filters, reported_by_me: '' })}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Bulk Actions */}
      {selectedTickets.length > 0 && (
        <BulkActions
          selectedIds={selectedTickets}
          onBulkUpdate={(updates) => {
            console.log('Bulk update:', updates, selectedTickets);
            toast.success(`Updated ${selectedTickets.length} ticket(s) successfully! ✅`);
            // Mock update - in real app, call API
            setSelectedTickets([]);
            setSelectAll(false);
            fetchTickets();
          }}
          onBulkDelete={() => {
            console.log('Bulk delete:', selectedTickets);
            toast.success(`Deleted ${selectedTickets.length} ticket(s) successfully! 🗑️`);
            setSelectedTickets([]);
            setSelectAll(false);
            fetchTickets();
          }}
          users={users}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ 
              bgcolor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.02)' 
            }}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={paginatedTickets.length > 0 && paginatedTickets.every(t => selectedTickets.includes(t.id))}
                  indeterminate={paginatedTickets.some(t => selectedTickets.includes(t.id)) && !paginatedTickets.every(t => selectedTickets.includes(t.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newSelected = [...new Set([...selectedTickets, ...paginatedTickets.map(t => t.id)])];
                      setSelectedTickets(newSelected);
                    } else {
                      const pageIds = paginatedTickets.map(t => t.id);
                      setSelectedTickets(selectedTickets.filter(id => !pageIds.includes(id)));
                    }
                  }}
                />
              </TableCell>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Tags</strong></TableCell>
              <TableCell><strong>Project</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Priority</strong></TableCell>
              <TableCell><strong>Assignee</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ border: 'none', py: 0 }}>
                  <EmptyState
                    title={Object.values(filters).some(v => v !== '' && v !== (user.role === 'USER' ? 'true' : ''))
                      ? 'No tickets match your filters'
                      : 'No tickets yet'}
                    description={Object.values(filters).some(v => v !== '' && v !== (user.role === 'USER' ? 'true' : ''))
                      ? 'Try adjusting your search criteria or clear filters'
                      : 'Create your first ticket to start tracking issues'}
                    actionLabel="Create Ticket"
                    onAction={Object.values(filters).some(v => v !== '' && v !== (user.role === 'USER' ? 'true' : '')) ? null : () => setOpenDialog(true)}
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedTickets.map((ticket) => {
                const isSelected = selectedTickets.includes(ticket.id);
                return (
                  <TableRow 
                    key={ticket.id} 
                    hover
                    selected={isSelected}
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' },
                      '&.Mui-selected': { bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.light' } }
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTickets([...selectedTickets, ticket.id]);
                          } else {
                            setSelectedTickets(selectedTickets.filter(id => id !== ticket.id));
                            setSelectAll(false);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        #{ticket.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.type}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography 
                          variant="body2" 
                          fontWeight="medium"
                          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                          onClick={() => navigate(`/tickets/${encodeId(ticket.id)}`)}
                        >
                          {ticket.title}
                        </Typography>
                        {ticket.is_breached && (
                          <Chip 
                            label="BREACHED" 
                            color="error" 
                            size="small" 
                            sx={{ mt: 0.5, fontSize: '0.65rem', fontWeight: 'bold' }} 
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {ticket.tags && ticket.tags.length > 0 ? (
                          ticket.tags.slice(0, 2).map(tagId => {
                            const tag = mockTags.find(t => t.id === tagId);
                            return tag ? (
                              <Chip
                                key={tag.id}
                                label={tag.name}
                                size="small"
                                sx={{
                                  bgcolor: tag.color || 'primary.main',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  height: 20
                                }}
                              />
                            ) : null;
                          })
                        ) : (
                          <Typography variant="caption" color="text.secondary">-</Typography>
                        )}
                        {ticket.tags && ticket.tags.length > 2 && (
                          <Chip
                            label={`+${ticket.tags.length - 2}`}
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{ticket.project_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ticket.status.replace('_', ' ')} 
                        color={getStatusColor(ticket.status)} 
                        size="small"
                        sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ticket.priority} 
                        color={getPriorityColor(ticket.priority)} 
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      {ticket.assignee_name ? (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {ticket.assignee_name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">{ticket.assignee_name}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">Unassigned</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {ticket.due_date ? (
                        <Typography 
                          variant="body2"
                          color={new Date(ticket.due_date) < new Date() ? 'error.main' : 'text.primary'}
                          fontWeight={new Date(ticket.due_date) < new Date() ? 'bold' : 'normal'}
                        >
                          {new Date(ticket.due_date).toLocaleDateString()}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5} alignItems="center">
                        <Tooltip title="View ticket">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/tickets/${encodeId(ticket.id)}`)}
                            sx={{ color: 'primary.main' }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copy ticket link">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              const ticketUrl = `${window.location.origin}/tickets/${encodeId(ticket.id)}`;
                              navigator.clipboard.writeText(ticketUrl).then(() => {
                                toast.success('Ticket link copied to clipboard! 🔗', {
                                  duration: 3000,
                                });
                              }).catch(() => {
                                toast.error('Failed to copy link');
                              });
                            }}
                            sx={{ 
                              color: 'text.secondary',
                              '&:hover': { 
                                color: 'primary.main',
                                bgcolor: 'primary.light'
                              }
                            }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
          {tickets.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={11}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body2" color="text.secondary">
                        Showing {startIndex + 1} to {Math.min(endIndex, tickets.length)} of {tickets.length} tickets
                      </Typography>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Rows per page</InputLabel>
                        <Select
                          value={rowsPerPage}
                          label="Rows per page"
                          onChange={handleRowsPerPageChange}
                        >
                          <MenuItem value={5}>5</MenuItem>
                          <MenuItem value={10}>10</MenuItem>
                          <MenuItem value={25}>25</MenuItem>
                          <MenuItem value={50}>50</MenuItem>
                          <MenuItem value={100}>100</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>
      )}

      {/* Grid/Card View */}
      {viewMode === 'grid' && (
        <Box>
          {tickets.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', boxShadow: 2 }}>
              <EmptyState
                title={Object.values(filters).some(v => v !== '' && v !== (user.role === 'USER' ? 'true' : ''))
                  ? 'No tickets match your filters'
                  : 'No tickets yet'}
                description={Object.values(filters).some(v => v !== '' && v !== (user.role === 'USER' ? 'true' : ''))
                  ? 'Try adjusting your search criteria or clear filters'
                  : 'Create your first ticket to start tracking issues'}
                actionLabel="Create Ticket"
                onAction={Object.values(filters).some(v => v !== '' && v !== (user.role === 'USER' ? 'true' : '')) ? null : () => setOpenDialog(true)}
              />
            </Paper>
          ) : (
            <>
              <Grid container spacing={3}>
                {paginatedTickets.map((ticket) => {
                  const isSelected = selectedTickets.includes(ticket.id);
                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={ticket.id}>
                      <Paper
                        sx={{
                          p: 2.5,
                          boxShadow: 3,
                          borderRadius: 2,
                          border: isSelected ? 2 : 1,
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          bgcolor: isSelected ? 'primary.light' : 'background.paper',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 6,
                            borderColor: 'primary.main'
                          },
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTickets(selectedTickets.filter(id => id !== ticket.id));
                          } else {
                            setSelectedTickets([...selectedTickets, ticket.id]);
                          }
                        }}
                      >
                        {/* Header */}
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Checkbox
                              checked={isSelected}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (e.target.checked) {
                                  setSelectedTickets([...selectedTickets, ticket.id]);
                                } else {
                                  setSelectedTickets(selectedTickets.filter(id => id !== ticket.id));
                                }
                              }}
                              size="small"
                            />
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              #{ticket.id}
                            </Typography>
                          </Box>
                          <Chip
                            label={ticket.type}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                          />
                        </Box>

                        {/* Title */}
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{
                            mb: 1.5,
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' },
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: 48
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tickets/${encodeId(ticket.id)}`);
                          }}
                        >
                          {ticket.title}
                        </Typography>

                        {/* Tags */}
                        {ticket.tags && ticket.tags.length > 0 && (
                          <Box display="flex" gap={0.5} flexWrap="wrap" mb={1.5}>
                            {ticket.tags.slice(0, 3).map(tagId => {
                              const tag = mockTags.find(t => t.id === tagId);
                              return tag ? (
                                <Chip
                                  key={tag.id}
                                  label={tag.name}
                                  size="small"
                                  sx={{
                                    bgcolor: tag.color || 'primary.main',
                                    color: 'white',
                                    fontSize: '0.65rem',
                                    height: 20,
                                    fontWeight: 500
                                  }}
                                />
                              ) : null;
                            })}
                            {ticket.tags.length > 3 && (
                              <Chip
                                label={`+${ticket.tags.length - 3}`}
                                size="small"
                                sx={{ fontSize: '0.65rem', height: 20 }}
                              />
                            )}
                          </Box>
                        )}

                        {/* Status and Priority */}
                        <Box display="flex" gap={1} mb={1.5} flexWrap="wrap">
                          <Chip
                            label={ticket.status.replace('_', ' ')}
                            color={getStatusColor(ticket.status)}
                            size="small"
                            sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                          />
                          <Chip
                            label={ticket.priority}
                            color={getPriorityColor(ticket.priority)}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                          {ticket.is_breached && (
                            <Chip
                              label="BREACHED"
                              color="error"
                              size="small"
                              sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}
                            />
                          )}
                        </Box>

                        {/* Project */}
                        <Box display="flex" alignItems="center" gap={0.5} mb={1.5}>
                          <Typography variant="caption" color="text.secondary">
                            Project:
                          </Typography>
                          <Typography variant="caption" fontWeight="medium">
                            {ticket.project_name}
                          </Typography>
                        </Box>

                        {/* Assignee */}
                        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                          {ticket.assignee_name ? (
                            <>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                {ticket.assignee_name.charAt(0)}
                              </Avatar>
                              <Typography variant="caption" fontWeight="medium">
                                {ticket.assignee_name}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Unassigned
                            </Typography>
                          )}
                        </Box>

                        {/* Due Date */}
                        {ticket.due_date && (
                          <Box display="flex" alignItems="center" gap={0.5} mb={1.5}>
                            <Typography variant="caption" color="text.secondary">
                              Due:
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight="medium"
                              color={new Date(ticket.due_date) < new Date() ? 'error.main' : 'text.primary'}
                            >
                              {new Date(ticket.due_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}

                        {/* Footer */}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mt="auto"
                          pt={1.5}
                          sx={{ borderTop: 1, borderColor: 'divider' }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </Typography>
                          <Box display="flex" gap={0.5}>
                            <Tooltip title="View ticket">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/tickets/${encodeId(ticket.id)}`);
                                }}
                                sx={{ color: 'primary.main' }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Copy ticket link">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const ticketUrl = `${window.location.origin}/tickets/${encodeId(ticket.id)}`;
                                  navigator.clipboard.writeText(ticketUrl).then(() => {
                                    toast.success('Ticket link copied to clipboard! 🔗', {
                                      duration: 3000,
                                    });
                                  }).catch(() => {
                                    toast.error('Failed to copy link');
                                  });
                                }}
                                sx={{ 
                                  color: 'text.secondary',
                                  '&:hover': { 
                                    color: 'primary.main',
                                    bgcolor: 'primary.light'
                                  }
                                }}
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Pagination for Grid View */}
              {tickets.length > 0 && (
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 3, py: 2 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" color="text.secondary">
                      Showing {startIndex + 1} to {Math.min(endIndex, tickets.length)} of {tickets.length} tickets
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Rows per page</InputLabel>
                      <Select
                        value={rowsPerPage}
                        label="Rows per page"
                        onChange={handleRowsPerPageChange}
                      >
                        <MenuItem value={8}>8</MenuItem>
                        <MenuItem value={12}>12</MenuItem>
                        <MenuItem value={16}>16</MenuItem>
                        <MenuItem value={24}>24</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {/* Advanced Search Dialog */}
      <AdvancedSearch
        open={advancedSearchOpen}
        onClose={() => setAdvancedSearchOpen(false)}
        onSearch={(criteria) => {
          // Apply advanced search criteria
          const newFilters = {
            ...filters,
            search: criteria.query,
            status: criteria.status.length > 0 ? criteria.status[0] : '',
            priority: criteria.priority.length > 0 ? criteria.priority[0] : '',
            type: criteria.type.length > 0 ? criteria.type[0] : '',
            project_id: criteria.project_ids.length > 0 ? criteria.project_ids[0] : '',
            assignee_id: criteria.assignee_ids.length > 0 ? criteria.assignee_ids[0] : '',
            is_breached: criteria.is_breached
          };
          setFilters(newFilters);
        }}
        onSave={(filter) => {
          const newFilter = {
            id: Date.now(),
            ...filter
          };
          setSavedFilters([...savedFilters, newFilter]);
          // In real app, save to localStorage or API
          localStorage.setItem('savedFilters', JSON.stringify([...savedFilters, newFilter]));
        }}
        savedFilters={savedFilters}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Ticket</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Project</InputLabel>
            <Select
              value={formData.project_id}
              label="Project"
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              label="Type"
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value="TASK">Task</MenuItem>
              <MenuItem value="BUG">Bug</MenuItem>
              <MenuItem value="ISSUE">Issue</MenuItem>
              <MenuItem value="SUGGESTION">Suggestion</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
          />
          <Box sx={{ mt: 2, mb: 1 }}>
            <MentionableRichTextEditor
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onMentionsChange={(userIds) => setFormData({ ...formData, mentioned_users: userIds })}
              label="Description"
              minHeight={150}
              users={users}
            />
          </Box>
          <Box sx={{ mt: 2, mb: 1 }}>
            <TagSelector
              value={formData.tags || []}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              label="Tags (Optional)"
            />
          </Box>
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              label="Priority"
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Module</InputLabel>
            <Select
              value={formData.module}
              label="Module"
              onChange={(e) => setFormData({ ...formData, module: e.target.value })}
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
          {user.role === 'ADMIN' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Assignee</InputLabel>
              <Select
                value={formData.assignee_id}
                label="Assignee"
                onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!formData.project_id || !formData.title}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Advanced Search Dialog */}
      <AdvancedSearch
        open={advancedSearchOpen}
        onClose={() => setAdvancedSearchOpen(false)}
        onSearch={(criteria) => {
          // Apply advanced search criteria
          const newFilters = {
            ...filters,
            search: criteria.query,
            status: criteria.status.length > 0 ? criteria.status[0] : '',
            priority: criteria.priority.length > 0 ? criteria.priority[0] : '',
            type: criteria.type.length > 0 ? criteria.type[0] : '',
            project_id: criteria.project_ids.length > 0 ? criteria.project_ids[0] : '',
            assignee_id: criteria.assignee_ids.length > 0 ? criteria.assignee_ids[0] : '',
            is_breached: criteria.is_breached
          };
          setFilters(newFilters);
        }}
        onSave={(filter) => {
          const newFilter = {
            id: Date.now(),
            ...filter
          };
          const updated = [...savedFilters, newFilter];
          setSavedFilters(updated);
          localStorage.setItem('savedFilters', JSON.stringify(updated));
        }}
        savedFilters={savedFilters}
      />

      {/* Ticket Template Dialog */}
      <TicketTemplate
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        onSelect={(templateData) => {
          setFormData({
            ...formData,
            ...templateData
          });
          setOpenDialog(true);
          setTemplateDialogOpen(false);
        }}
        projects={projects}
      />
    </Box>
  );
};

export default Tickets;
