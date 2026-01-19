import { useState, useEffect } from 'react';
import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Divider,
  Stack
} from '@mui/material';
import RoleSwitcher from '../components/RoleSwitcher';
import {
  Assignment,
  AssignmentInd,
  Warning,
  CheckCircle,
  HourglassEmpty,
  BugReport,
  Task,
  Lightbulb,
  TrendingUp,
  Person,
  Group,
  Folder,
  AccessTime,
  PriorityHigh,
  Add
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { mockApi, mockUser, USE_MOCK_DATA } from '../data/mockData';
import { encodeId } from '../utils/idEncoder';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentTickets, setRecentTickets] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      let ticketsRes, breachedRes;
      
      if (USE_MOCK_DATA) {
        ticketsRes = await mockApi.getTickets({
          assigned_to_me: user.role === 'USER' ? 'true' : undefined,
          reported_by_me: user.role === 'USER' ? 'true' : undefined
        });
        breachedRes = await mockApi.getTickets({ is_breached: 'true' });
      } else {
        [ticketsRes, breachedRes] = await Promise.all([
          api.get('/tickets', {
            params: {
              assigned_to_me: user.role === 'USER' ? 'true' : undefined,
              reported_by_me: user.role === 'USER' ? 'true' : undefined
            }
          }),
          api.get('/tickets', {
            params: { is_breached: 'true' }
          })
        ]);
      }

      // Backend returns: { data: [...], pagination: {...} }
      const tickets = USE_MOCK_DATA ? ticketsRes.data : (ticketsRes.data?.data || []);
      const breachedTickets = USE_MOCK_DATA ? breachedRes.data : (breachedRes.data?.data || []);
      
      const allTickets = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'ORG_ADMIN' ? tickets : tickets;
      const assigned = tickets.filter((t) => t.assignee_id === user.id);
      const reported = tickets.filter((t) => t.reporter_id === user.id);

      const statsData = {
        assigned,
        reported,
        breached: breachedTickets,
        all: allTickets
      };

      // Get recent tickets (last 5)
      const recent = allTickets
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setStats(statsData);
      setRecentTickets(recent);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusCounts = (tickets) => {
    return tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {});
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'BUG':
        return <BugReport fontSize="small" />;
      case 'TASK':
        return <Task fontSize="small" />;
      case 'SUGGESTION':
        return <Lightbulb fontSize="small" />;
      default:
        return <Assignment fontSize="small" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SOLVED':
      case 'CLOSED':
        return 'success';
      case 'IN_PROGRESS':
        return 'primary';
      case 'DEPENDENCY':
      case 'HOLD':
        return 'warning';
      case 'CREATED':
        return 'default';
      default:
        return 'default';
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, gradient }) => {
    return (
      <Card
        sx={(theme) => ({
          height: '100%',
          background: gradient
            ? `linear-gradient(135deg, ${theme.palette[color]?.main || theme.palette.primary.main} 0%, ${theme.palette[color]?.dark || theme.palette.primary.dark} 100%)`
            : theme.palette.mode === 'dark' 
              ? theme.palette.background.paper 
              : theme.palette.background.paper,
          color: gradient ? 'white' : theme.palette.text.primary,
          boxShadow: 3,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6
          }
        })}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography
                variant="h6"
                sx={{ mb: 1, opacity: gradient ? 0.9 : 0.7, fontSize: '0.875rem' }}
              >
                {title}
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 'bold', mb: 0.5 }}
              >
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="body2" sx={{ opacity: gradient ? 0.8 : 0.6 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Avatar
              sx={(theme) => ({
                bgcolor: gradient 
                  ? 'rgba(255,255,255,0.2)' 
                  : (theme.palette[color]?.light || theme.palette.primary.light),
                color: gradient 
                  ? 'white' 
                  : (theme.palette[color]?.main || theme.palette.primary.main),
                width: 56,
                height: 56
              })}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const StatusBreakdownCard = ({ title, tickets, icon, color }) => {
    const statusCounts = getStatusCounts(tickets);
    const total = tickets.length;
    const statusOrder = ['CREATED', 'IN_PROGRESS', 'DEPENDENCY', 'HOLD', 'SOLVED', 'CLOSED'];

    return (
      <Card sx={{ height: '100%', boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar 
              sx={{ 
                bgcolor: (theme) => theme.palette[color]?.light || theme.palette.primary.light,
                color: (theme) => theme.palette[color]?.main || theme.palette.primary.main,
                mr: 2 
              }}
            >
              {icon}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {total} total tickets
              </Typography>
            </Box>
          </Box>

          <Stack spacing={2}>
            {statusOrder
              .filter((status) => statusCounts[status])
              .map((status) => {
                const count = statusCounts[status];
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <Box key={status}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Chip
                        label={status.replace('_', ' ')}
                        size="small"
                        color={getStatusColor(status)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                      <Typography variant="body2" fontWeight="medium">
                        {count}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={(theme) => {
                        const statusColor = getStatusColor(status);
                        return {
                          height: 8,
                          borderRadius: 4,
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : 'rgba(0, 0, 0, 0.08)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: theme.palette[statusColor]?.main || theme.palette.primary.main
                          }
                        };
                      }}
                    />
                  </Box>
                );
              })}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) return null;

  const allTickets = user.role === 'ADMIN' ? stats.all : [...stats.assigned, ...stats.reported];
  const totalTickets = allTickets.length;
  const highPriority = allTickets.filter((t) => t.priority === 'HIGH').length;
  const inProgress = allTickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const solved = allTickets.filter((t) => t.status === 'SOLVED' || t.status === 'CLOSED').length;

  return (
    <Box>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Typography variant="h4" fontWeight="bold">
              Dashboard
            </Typography>
            <Chip
              label={user.role}
              color={user.role === 'ADMIN' ? 'primary' : 'default'}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user.name}! 👋
          </Typography>
          {USE_MOCK_DATA && (
            <Box mt={1}>
              <RoleSwitcher />
            </Box>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/tickets')}
          sx={{ borderRadius: 2 }}
        >
          New Ticket
        </Button>
      </Box>

      {/* Role-based Info Card */}
      {user.role === 'ADMIN' ? (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2" fontWeight="medium">
            👑 Admin Mode: You have full access to all features including user management, team management, and all projects.
          </Typography>
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2" fontWeight="medium">
            👤 User Mode: You can view and manage tickets in your assigned projects. Contact an admin for additional access.
          </Typography>
        </Alert>
      )}

      {/* Breached Tickets Alert */}
      {stats.breached.length > 0 && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
            boxShadow: 2,
            '& .MuiAlert-icon': { fontSize: 28 }
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            ⚠️ {stats.breached.length} SLA Breach Alert{stats.breached.length > 1 ? 's' : ''}
          </Typography>
          <Typography variant="body2">
            {stats.breached.map((t) => `#${t.id}: ${t.title}`).join(' • ')}
          </Typography>
        </Alert>
      )}

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tickets"
            value={totalTickets}
            icon={<Assignment />}
            color="primary"
            subtitle="All projects"
            gradient
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={inProgress}
            icon={<TrendingUp />}
            color="info"
            subtitle="Active work"
            gradient
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="High Priority"
            value={highPriority}
            icon={<PriorityHigh />}
            color="error"
            subtitle="Requires attention"
            gradient
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={solved}
            icon={<CheckCircle />}
            color="success"
            subtitle="Resolved tickets"
            gradient
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Status Breakdown */}
        {user.role === 'USER' ? (
          <>
            <Grid item xs={12} md={6}>
              <StatusBreakdownCard
                title="Assigned to Me"
                tickets={stats.assigned}
                icon={<AssignmentInd />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StatusBreakdownCard
                title="Reported by Me"
                tickets={stats.reported}
                icon={<Person />}
                color="secondary"
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} md={6}>
              <StatusBreakdownCard
                title="All Tickets"
                tickets={allTickets}
                icon={<Assignment />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StatusBreakdownCard
                title="Breached Tickets"
                tickets={stats.breached}
                icon={<Warning />}
                color="error"
              />
            </Grid>
          </>
        )}

        {/* Recent Tickets */}
        <Grid item xs={12} md={user.role === 'ADMIN' ? 12 : 12}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Tickets
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/tickets')}
                  sx={{ textTransform: 'none' }}
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {recentTickets.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No tickets found
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentTickets.map((ticket, index) => (
                    <React.Fragment key={ticket.id}>
                      <ListItem
                        sx={{
                          borderRadius: 2,
                          mb: 1.5,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: 1,
                          '&:hover': {
                            bgcolor: 'action.hover',
                            transform: 'translateX(4px)',
                            boxShadow: 3
                          }
                        }}
                        onClick={() => navigate(`/tickets/${encodeId(ticket.id)}`)}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={(theme) => {
                              const priorityColor = getPriorityColor(ticket.priority);
                              return {
                                bgcolor: theme.palette[priorityColor]?.light || theme.palette.primary.light,
                                color: theme.palette[priorityColor]?.main || theme.palette.primary.main
                              };
                            }}
                          >
                            {getTypeIcon(ticket.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                              <Typography variant="subtitle1" fontWeight="medium">
                                {ticket.title}
                              </Typography>
                              {ticket.is_breached && (
                                <Chip
                                  label="BREACHED"
                                  color="error"
                                  size="small"
                                  sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography
                              component="div"
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                <Chip
                                  label={ticket.status.replace('_', ' ')}
                                  size="small"
                                  color={getStatusColor(ticket.status)}
                                  sx={{ textTransform: 'capitalize', height: 20 }}
                                />
                                <Chip
                                  label={ticket.priority}
                                  size="small"
                                  color={getPriorityColor(ticket.priority)}
                                  sx={{ height: 20 }}
                                />
                                <Typography variant="caption" color="text.secondary" component="span">
                                  {ticket.project_name}
                                </Typography>
                                {ticket.assignee_name && (
                                  <>
                                    <Typography variant="caption" color="text.secondary" component="span">
                                      •
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" component="span">
                                      {ticket.assignee_name}
                                    </Typography>
                                  </>
                                )}
                              </Box>
                            </Typography>
                          }
                        />
                        <Box textAlign="right">
                          <Typography variant="caption" color="text.secondary">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </ListItem>
                      {index < recentTickets.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions (Admin only) */}
        {user.role === 'ADMIN' && (
          <Grid item xs={12}>
            <Card sx={{ boxShadow: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Actions
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Folder />}
                    onClick={() => navigate('/projects')}
                    sx={{ borderRadius: 2 }}
                  >
                    Manage Projects
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Group />}
                    onClick={() => navigate('/teams')}
                    sx={{ borderRadius: 2 }}
                  >
                    Manage Teams
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Person />}
                    onClick={() => navigate('/users')}
                    sx={{ borderRadius: 2 }}
                  >
                    Manage Users
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
