// Role Hierarchy System
// SuperAdmin > Organization Admin > Team Lead > User

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ORG_ADMIN: 'ORG_ADMIN',
  TEAM_LEAD: 'TEAM_LEAD',
  USER: 'USER'
};

export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 4,
  [ROLES.ORG_ADMIN]: 3,
  [ROLES.TEAM_LEAD]: 2,
  [ROLES.USER]: 1
};

// Check if user has permission based on role
export const hasPermission = (userRole, requiredRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

// Check if user can access a feature
export const canAccess = (user, feature) => {
  if (!user) return false;
  
  const { role, organization_id, team_id } = user;

  switch (feature) {
    // Only Super Admin can manage organizations
    case 'manage_organizations':
      return role === ROLES.SUPER_ADMIN;
    
    // Super Admin and Org Admin can manage users (Org Admin only within their org)
    case 'manage_org_users':
      return role === ROLES.SUPER_ADMIN || role === ROLES.ORG_ADMIN;
    
    // Super Admin and Org Admin can manage teams (Org Admin only within their org)
    case 'manage_org_teams':
      return role === ROLES.SUPER_ADMIN || role === ROLES.ORG_ADMIN;
    
    // Super Admin, Org Admin, and Team Lead can manage team members
    case 'manage_team_members':
      return role === ROLES.SUPER_ADMIN || role === ROLES.ORG_ADMIN || role === ROLES.TEAM_LEAD;
    
    // Super Admin, Org Admin, and Team Lead can create projects
    case 'create_projects':
      return role === ROLES.SUPER_ADMIN || role === ROLES.ORG_ADMIN || role === ROLES.TEAM_LEAD;
    
    // Super Admin and Org Admin can view all projects
    case 'view_all_projects':
      return role === ROLES.SUPER_ADMIN || role === ROLES.ORG_ADMIN;
    
    // Super Admin and Org Admin can view all tickets
    case 'view_all_tickets':
      return role === ROLES.SUPER_ADMIN || role === ROLES.ORG_ADMIN;
    
    // Super Admin, Org Admin, and Team Lead can assign tickets
    case 'assign_tickets':
      return role === ROLES.SUPER_ADMIN || role === ROLES.ORG_ADMIN || role === ROLES.TEAM_LEAD;
    
    // Super Admin and Org Admin can delete tickets
    case 'delete_tickets':
      return role === ROLES.SUPER_ADMIN || role === ROLES.ORG_ADMIN;
    
    // Super Admin and Org Admin can delete projects
    case 'delete_projects':
      return role === ROLES.SUPER_ADMIN || role === ROLES.ORG_ADMIN;
    
    // Super Admin and Org Admin can create teams
    case 'create_teams':
      return role === ROLES.SUPER_ADMIN || role === ROLES.ORG_ADMIN;
    
    // Super Admin and Org Admin can create users (including team leads)
    case 'create_users':
      return role === ROLES.SUPER_ADMIN || role === ROLES.ORG_ADMIN;
    
    // Team Lead can create users (only regular users in their team)
    case 'create_team_users':
      return role === ROLES.SUPER_ADMIN || role === ROLES.ORG_ADMIN || role === ROLES.TEAM_LEAD;
    
    default:
      return false;
  }
};

// Check if user can create a specific role
export const canCreateRole = (user, targetRole) => {
  if (!user) return false;
  const { role } = user;

  // Super Admin can create any role
  if (role === ROLES.SUPER_ADMIN) return true;

  // Org Admin can create: ORG_ADMIN, TEAM_LEAD, USER (within their org)
  if (role === ROLES.ORG_ADMIN) {
    return targetRole === ROLES.ORG_ADMIN || targetRole === ROLES.TEAM_LEAD || targetRole === ROLES.USER;
  }

  // Team Lead can only create: USER (in their team)
  if (role === ROLES.TEAM_LEAD) {
    return targetRole === ROLES.USER;
  }

  return false;
};

// Get menu items based on role
export const getMenuItems = (user) => {
  if (!user) return [];
  
  const { role } = user;
  const baseItems = [
    { text: 'Dashboard', icon: 'Dashboard', path: '/dashboard' },
    { text: 'Projects', icon: 'Folder', path: '/projects' },
    { text: 'Tickets', icon: 'Assignment', path: '/tickets' }
  ];

  if (role === ROLES.SUPER_ADMIN) {
    return [
      ...baseItems,
      { text: 'Organizations', icon: 'Business', path: '/organizations' },
      { text: 'Users', icon: 'People', path: '/users' },
      { text: 'Teams', icon: 'Groups', path: '/teams' }
    ];
  }

  if (role === ROLES.ORG_ADMIN) {
    return [
      ...baseItems,
      { text: 'Users', icon: 'People', path: '/users' },
      { text: 'Teams', icon: 'Groups', path: '/teams' }
    ];
  }

  if (role === ROLES.TEAM_LEAD) {
    return [
      ...baseItems,
      { text: 'Team Members', icon: 'People', path: '/users' } // Using /users for now
    ];
  }

  // Regular USER role
  return baseItems;
};

// Get role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.ORG_ADMIN]: 'Organization Admin',
    [ROLES.TEAM_LEAD]: 'Team Lead',
    [ROLES.USER]: 'User'
  };
  return roleNames[role] || role;
};

// Get role color for chips
export const getRoleColor = (role) => {
  const roleColors = {
    [ROLES.SUPER_ADMIN]: 'error',
    [ROLES.ORG_ADMIN]: 'primary',
    [ROLES.TEAM_LEAD]: 'secondary',
    [ROLES.USER]: 'default'
  };
  return roleColors[role] || 'default';
};
