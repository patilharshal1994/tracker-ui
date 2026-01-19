// Mock data for frontend development without backend

// Set to true to use mock data instead of real API
export const USE_MOCK_DATA = true;

export const mockUser = {
  id: 1,
  name: 'Admin User',
  email: 'admin@tracker.com',
  role: 'ADMIN',
  team_id: 1,
  is_active: true
};

export const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@tracker.com',
    role: 'ADMIN',
    team_id: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'John Doe',
    email: 'user1@tracker.com',
    role: 'USER',
    team_id: 1,
    is_active: true,
    created_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 3,
    name: 'Jane Smith',
    email: 'user2@tracker.com',
    role: 'USER',
    team_id: 1,
    is_active: true,
    created_at: '2024-01-03T00:00:00Z'
  }
];

export const mockTeams = [
  {
    id: 1,
    name: 'Development Team',
    created_at: '2024-01-01T00:00:00Z',
    members: [
      { id: 1, name: 'Admin User', email: 'admin@tracker.com', role: 'ADMIN' },
      { id: 2, name: 'John Doe', email: 'user1@tracker.com', role: 'USER' },
      { id: 3, name: 'Jane Smith', email: 'user2@tracker.com', role: 'USER' }
    ]
  },
  {
    id: 2,
    name: 'QA Team',
    created_at: '2024-01-05T00:00:00Z',
    members: []
  }
];

export const mockProjects = [
  {
    id: 1,
    name: 'Website Redesign',
    description: 'Complete redesign of company website with modern UI/UX',
    created_by: 1,
    team_id: 1,
    created_at: '2024-01-10T00:00:00Z',
    creator_name: 'Admin User',
    team_name: 'Development Team',
    members: [
      { id: 1, name: 'Admin User', email: 'admin@tracker.com', role: 'ADMIN' },
      { id: 2, name: 'John Doe', email: 'user1@tracker.com', role: 'USER' }
    ],
    ticketStats: {
      CREATED: 2,
      IN_PROGRESS: 3,
      SOLVED: 1,
      CLOSED: 0
    }
  },
  {
    id: 2,
    name: 'Mobile App',
    description: 'New mobile application for iOS and Android',
    created_by: 1,
    team_id: 1,
    created_at: '2024-01-15T00:00:00Z',
    creator_name: 'Admin User',
    team_name: 'Development Team',
    members: [
      { id: 2, name: 'John Doe', email: 'user1@tracker.com', role: 'USER' },
      { id: 3, name: 'Jane Smith', email: 'user2@tracker.com', role: 'USER' }
    ],
    ticketStats: {
      CREATED: 1,
      IN_PROGRESS: 2,
      SOLVED: 0,
      CLOSED: 0
    }
  }
];

// Mock Tags
export const mockTags = [
  { id: 1, name: 'Frontend', color: '#1976d2' },
  { id: 2, name: 'Backend', color: '#dc004e' },
  { id: 3, name: 'UI/UX', color: '#2e7d32' },
  { id: 4, name: 'Bug', color: '#d32f2f' },
  { id: 5, name: 'Feature', color: '#ed6c02' },
  { id: 6, name: 'Urgent', color: '#9c27b0' },
  { id: 7, name: 'Mobile', color: '#0288d1' }
];

// Mock Notifications
export const mockNotifications = [
  {
    id: 1,
    user_id: 1,
    type: 'ticket_created',
    title: 'New Ticket Created',
    message: 'Ticket #1 "Design new homepage layout" was created',
    related_ticket_id: 1,
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    user_id: 1,
    type: 'comment_added',
    title: 'New Comment',
    message: 'John Doe commented on ticket #1',
    related_ticket_id: 1,
    related_comment_id: 1,
    is_read: false,
    created_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 3,
    user_id: 1,
    type: 'assigned',
    title: 'Ticket Assigned',
    message: 'You were assigned to ticket #2',
    related_ticket_id: 2,
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export const mockTickets = [
  {
    id: 1,
    project_id: 1,
    type: 'TASK',
    title: 'Design new homepage layout',
    description: '<p>Create wireframes and mockups for the new homepage with modern design principles.</p><ul><li>Responsive design</li><li>Modern UI components</li><li>Accessibility compliance</li></ul>',
    reporter_id: 1,
    assignee_id: 2,
    branch_name: 'feature/homepage-design',
    scenario: 'User should see a clean, modern homepage with clear navigation',
    start_date: '2024-01-20',
    due_date: '2024-01-27T23:59:59Z',
    duration_hours: 40,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    is_breached: false,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-22T14:30:00Z',
    project_name: 'Website Redesign',
    reporter_name: 'Admin User',
    reporter_email: 'admin@tracker.com',
    assignee_name: 'John Doe',
    assignee_email: 'user1@tracker.com',
    tags: [1, 3, 5], // Frontend, UI/UX, Feature
    attachments: [
      { id: 1, file_name: 'wireframe.pdf', file_size: 245678, mime_type: 'application/pdf', uploaded_at: '2024-01-20T10:30:00Z' }
    ],
    watchers: [1, 2],
    time_logs: [
      { id: 1, ticket_id: 1, user_id: 2, user_name: 'John Doe', hours: 4.5, description: 'Worked on wireframes', logged_date: '2024-01-21' },
      { id: 2, ticket_id: 1, user_id: 2, user_name: 'John Doe', hours: 3.0, description: 'Design review', logged_date: '2024-01-22' }
    ],
    comments: [
      {
        id: 1,
        ticket_id: 1,
        user_id: 2,
        comment_text: '<p>Started working on the wireframes. Will share initial designs by end of week.</p>',
        attachment_url: null,
        created_at: '2024-01-21T09:00:00Z',
        user_name: 'John Doe',
        user_email: 'user1@tracker.com'
      }
    ],
    activities: [
      { id: 1, action_type: 'created', user_name: 'Admin User', description: 'Ticket created', created_at: '2024-01-20T10:00:00Z' },
      { id: 2, action_type: 'status_changed', user_name: 'John Doe', field_name: 'status', old_value: 'CREATED', new_value: 'IN_PROGRESS', created_at: '2024-01-21T09:00:00Z' }
    ],
    relationships: [
      { id: 1, ticket_id: 1, related_ticket_id: 2, relationship_type: 'relates_to' }
    ]
  },
  {
    id: 2,
    project_id: 1,
    type: 'BUG',
    title: 'Fix mobile menu not working',
    description: '<p>Mobile navigation menu is not responsive on iOS devices. Menu items are not clickable.</p><p><strong>Steps to reproduce:</strong></p><ol><li>Open website on iOS Safari</li><li>Click hamburger menu</li><li>Menu does not open</li></ol>',
    reporter_id: 2,
    assignee_id: 3,
    branch_name: 'bugfix/mobile-menu',
    scenario: 'On iOS Safari, when clicking the hamburger menu, nothing happens',
    start_date: '2024-01-18',
    due_date: '2024-01-25T23:59:59Z',
    duration_hours: 8,
    status: 'CREATED',
    priority: 'MEDIUM',
    is_breached: false,
    created_at: '2024-01-18T11:00:00Z',
    updated_at: '2024-01-18T11:00:00Z',
    project_name: 'Website Redesign',
    reporter_name: 'John Doe',
    reporter_email: 'user1@tracker.com',
    assignee_name: 'Jane Smith',
    assignee_email: 'user2@tracker.com',
    tags: [1, 4], // Frontend, Bug
    attachments: [],
    watchers: [2, 3],
    comments: [],
    activities: [
      { id: 3, action_type: 'created', user_name: 'John Doe', description: 'Ticket created', created_at: '2024-01-18T11:00:00Z' },
      { id: 4, action_type: 'assignee_changed', user_name: 'Admin User', field_name: 'assignee_id', old_value: null, new_value: 'Jane Smith', created_at: '2024-01-18T12:00:00Z' }
    ]
  },
  {
    id: 3,
    project_id: 1,
    type: 'SUGGESTION',
    title: 'Add dark mode support',
    description: 'Implement dark mode toggle for better user experience, especially for night-time usage',
    reporter_id: 3,
    assignee_id: null,
    branch_name: null,
    scenario: null,
    start_date: null,
    due_date: '2024-02-10T23:59:59Z',
    duration_hours: 16,
    status: 'CREATED',
    priority: 'LOW',
    is_breached: false,
    created_at: '2024-01-22T15:00:00Z',
    updated_at: '2024-01-22T15:00:00Z',
    project_name: 'Website Redesign',
    reporter_name: 'Jane Smith',
    reporter_email: 'user2@tracker.com',
    assignee_name: null,
    assignee_email: null,
    comments: []
  },
  {
    id: 4,
    project_id: 2,
    type: 'TASK',
    title: 'Setup React Native project',
    description: 'Initialize React Native project with TypeScript and configure development environment',
    reporter_id: 1,
    assignee_id: 2,
    branch_name: 'feature/setup-rn',
    scenario: 'Create new React Native project with all necessary dependencies',
    start_date: '2024-01-16',
    due_date: '2024-01-23T23:59:59Z',
    duration_hours: 4,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    is_breached: false,
    created_at: '2024-01-16T09:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
    project_name: 'Mobile App',
    reporter_name: 'Admin User',
    reporter_email: 'admin@tracker.com',
    assignee_name: 'John Doe',
    assignee_email: 'user1@tracker.com',
    comments: []
  },
  {
    id: 5,
    project_id: 2,
    type: 'ISSUE',
    title: 'API integration failing',
    description: 'API calls are timing out when fetching user data. Need to investigate and fix.',
    reporter_id: 2,
    assignee_id: 3,
    branch_name: 'bugfix/api-timeout',
    scenario: 'When user tries to login, API call times out after 30 seconds',
    start_date: '2024-01-19',
    due_date: '2024-01-24T23:59:59Z',
    duration_hours: 6,
    status: 'DEPENDENCY',
    priority: 'HIGH',
    is_breached: false,
    created_at: '2024-01-19T14:00:00Z',
    updated_at: '2024-01-21T16:00:00Z',
    project_name: 'Mobile App',
    reporter_name: 'John Doe',
    reporter_email: 'user1@tracker.com',
    assignee_name: 'Jane Smith',
    assignee_email: 'user2@tracker.com',
    comments: [
      {
        id: 2,
        ticket_id: 5,
        user_id: 3,
        comment_text: 'Waiting for backend team to fix the API endpoint. Blocked until then.',
        attachment_url: null,
        created_at: '2024-01-21T16:00:00Z',
        user_name: 'Jane Smith',
        user_email: 'user2@tracker.com'
      }
    ]
  },
  {
    id: 6,
    project_id: 1,
    type: 'BUG',
    title: 'Login page CSS broken',
    description: 'Login page styling is completely broken on mobile devices',
    reporter_id: 2,
    assignee_id: 2,
    branch_name: 'bugfix/login-css',
    scenario: 'On mobile, login form is not visible and buttons are misaligned',
    start_date: '2024-01-15',
    due_date: '2024-01-17T23:59:59Z',
    duration_hours: 4,
    status: 'SOLVED',
    priority: 'MEDIUM',
    is_breached: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-17T17:00:00Z',
    project_name: 'Website Redesign',
    reporter_name: 'John Doe',
    reporter_email: 'user1@tracker.com',
    assignee_name: 'John Doe',
    assignee_email: 'user1@tracker.com',
    comments: [
      {
        id: 3,
        ticket_id: 6,
        user_id: 2,
        comment_text: 'Fixed the CSS issues. Added responsive breakpoints for mobile.',
        attachment_url: null,
        created_at: '2024-01-17T17:00:00Z',
        user_name: 'John Doe',
        user_email: 'user1@tracker.com'
      }
    ]
  },
  {
    id: 7,
    project_id: 1,
    type: 'TASK',
    title: 'Update documentation',
    description: '<p>Update project documentation with latest API changes</p>',
    reporter_id: 1,
    assignee_id: null,
    branch_name: null,
    scenario: null,
    start_date: null,
    due_date: '2024-01-20T23:59:59Z',
    duration_hours: 2,
    status: 'CREATED',
    priority: 'LOW',
    is_breached: true,
    created_at: '2024-01-18T09:00:00Z',
    updated_at: '2024-01-18T09:00:00Z',
    project_name: 'Website Redesign',
    reporter_name: 'Admin User',
    reporter_email: 'admin@tracker.com',
    assignee_name: null,
    assignee_email: null,
    tags: [2], // Backend
    attachments: [],
    watchers: [1],
    comments: [],
    activities: [
      { id: 5, action_type: 'created', user_name: 'Admin User', description: 'Ticket created', created_at: '2024-01-18T09:00:00Z' }
    ]
  }
];

// Helper function to simulate API delay
export const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const mockApi = {
  // Auth
  login: async (email, password) => {
    await delay();
    if (email === 'admin@tracker.com' && password === 'password123') {
      return {
        data: {
          user: mockUser,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      };
    }
    throw { response: { data: { error: 'Invalid credentials' } } };
  },

  // Users
  getUsers: async () => {
    await delay();
    return { data: mockUsers };
  },
  getUser: async (id) => {
    await delay();
    const user = mockUsers.find(u => u.id === parseInt(id));
    if (!user) throw { response: { data: { error: 'User not found' } } };
    return { data: user };
  },

  // Teams
  getTeams: async () => {
    await delay();
    return { data: mockTeams };
  },
  getTeam: async (id) => {
    await delay();
    const team = mockTeams.find(t => t.id === parseInt(id));
    if (!team) throw { response: { data: { error: 'Team not found' } } };
    return { data: team };
  },

  // Projects
  getProjects: async () => {
    await delay();
    return { data: mockProjects };
  },
  getProject: async (id) => {
    await delay();
    const project = mockProjects.find(p => p.id === parseInt(id));
    if (!project) throw { response: { data: { error: 'Project not found' } } };
    return { data: project };
  },

  // Tickets
  getTickets: async (params = {}) => {
    await delay();
    let tickets = [...mockTickets];

    // Apply filters
    if (params.project_id) {
      tickets = tickets.filter(t => t.project_id === parseInt(params.project_id));
    }
    if (params.status) {
      tickets = tickets.filter(t => t.status === params.status);
    }
    if (params.priority) {
      tickets = tickets.filter(t => t.priority === params.priority);
    }
    if (params.type) {
      tickets = tickets.filter(t => t.type === params.type);
    }
    if (params.assignee_id) {
      if (params.assignee_id === 'null') {
        tickets = tickets.filter(t => !t.assignee_id);
      } else {
        tickets = tickets.filter(t => t.assignee_id === parseInt(params.assignee_id));
      }
    }
    if (params.reporter_id) {
      tickets = tickets.filter(t => t.reporter_id === parseInt(params.reporter_id));
    }
    if (params.assigned_to_me === 'true') {
      tickets = tickets.filter(t => t.assignee_id === mockUser.id);
    }
    if (params.reported_by_me === 'true') {
      tickets = tickets.filter(t => t.reporter_id === mockUser.id);
    }
    if (params.is_breached === 'true') {
      tickets = tickets.filter(t => t.is_breached === true);
    }

    return { data: tickets };
  },
  getTicket: async (id) => {
    await delay();
    const ticket = mockTickets.find(t => t.id === parseInt(id));
    if (!ticket) throw { response: { data: { error: 'Ticket not found' } } };
    return { data: ticket };
  },

  // Tags
  getTags: async () => {
    await delay();
    return { data: mockTags };
  },
  getTicketTags: async (ticketId) => {
    await delay();
    const ticket = mockTickets.find(t => t.id === parseInt(ticketId));
    if (!ticket) return { data: [] };
    const tags = mockTags.filter(tag => ticket.tags?.includes(tag.id));
    return { data: tags };
  },

  // Notifications
  getNotifications: async (params = {}) => {
    await delay();
    let notifications = [...mockNotifications];
    if (params.is_read !== undefined) {
      notifications = notifications.filter(n => n.is_read === (params.is_read === 'true'));
    }
    return { 
      data: notifications.slice(0, params.limit || 50),
      unread_count: notifications.filter(n => !n.is_read).length,
      total: notifications.length
    };
  },
  markNotificationAsRead: async (id) => {
    await delay();
    const notification = mockNotifications.find(n => n.id === parseInt(id));
    if (notification) notification.is_read = true;
    return { message: 'Notification marked as read' };
  },
  markAllNotificationsAsRead: async () => {
    await delay();
    mockNotifications.forEach(n => n.is_read = true);
    return { message: 'All notifications marked as read' };
  },

  // Activities
  getTicketActivities: async (ticketId) => {
    await delay();
    const ticket = mockTickets.find(t => t.id === parseInt(ticketId));
    if (!ticket) return { data: [] };
    return { data: ticket.activities || [] };
  }
};
