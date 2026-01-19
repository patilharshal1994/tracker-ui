# Role-Based Features Guide

## Overview
The Issue Tracker application has two user roles with different access levels and features.

## Roles

### 👑 ADMIN
**Full system access with all management capabilities**

#### Features:
- ✅ **Dashboard**
  - View all tickets across all projects
  - See breached tickets alerts
  - View comprehensive statistics
  - Quick action buttons for management

- ✅ **Projects**
  - Create new projects
  - Edit/Delete projects
  - Assign projects to teams
  - View all projects (not limited to assigned ones)
  - Manage project members

- ✅ **Tickets**
  - View all tickets (no filtering restrictions)
  - Create tickets in any project
  - Assign tickets to any user
  - Edit/Delete any ticket
  - Change ticket status and priority

- ✅ **Users Management** (Admin Only)
  - Create new users
  - Edit user details (name, email, role, team)
  - Activate/Deactivate users
  - Delete users
  - Assign users to teams

- ✅ **Teams Management** (Admin Only)
  - Create new teams
  - Edit team names
  - Delete teams
  - View team members
  - Assign teams to projects

- ✅ **Navigation**
  - Access to all menu items including Users and Teams

---

### 👤 USER
**Limited access focused on assigned work**

#### Features:
- ✅ **Dashboard**
  - View only assigned tickets
  - View only reported tickets
  - Personal statistics
  - No access to admin quick actions

- ✅ **Projects**
  - View only assigned projects
  - View projects assigned to their team
  - Cannot create/edit/delete projects
  - Cannot manage project members

- ✅ **Tickets**
  - View tickets in assigned projects only
  - Create tickets in assigned projects
  - Edit own tickets (reported by them)
  - Update status of assigned tickets
  - Cannot assign tickets to others
  - Filter by "Assigned to Me" / "Reported by Me"

- ❌ **Users Management** (Not Accessible)
  - Cannot access Users page
  - Menu item hidden

- ❌ **Teams Management** (Not Accessible)
  - Cannot access Teams page
  - Menu item hidden

---

## Visual Indicators

### Role Badge
- Displayed in:
  - Top navigation bar (next to user name)
  - Dashboard header
  - All page headers
  - Role switcher (demo mode)

### Color Coding
- **ADMIN**: Primary blue color
- **USER**: Default gray color

### Info Alerts
- Each page shows role-specific information about available features
- Dashboard shows role-based welcome message

---

## Demo Mode Features

### Role Switcher
In demo mode (with mock data), you can switch between roles:
- Located on Dashboard page
- Allows switching between Admin and User roles
- Shows all available users
- Automatically reloads page to update all role-based content

### Available Demo Users:
1. **Admin User** (admin@tracker.com)
   - Role: ADMIN
   - Full access to all features

2. **John Doe** (user1@tracker.com)
   - Role: USER
   - Limited access

3. **Jane Smith** (user2@tracker.com)
   - Role: USER
   - Limited access

---

## Access Control Summary

| Feature | ADMIN | USER |
|---------|-------|------|
| View All Projects | ✅ | ❌ (Only assigned) |
| Create Projects | ✅ | ❌ |
| Edit Projects | ✅ | ❌ |
| Delete Projects | ✅ | ❌ |
| View All Tickets | ✅ | ❌ (Only in assigned projects) |
| Create Tickets | ✅ (Any project) | ✅ (Assigned projects only) |
| Assign Tickets | ✅ | ❌ |
| Edit Any Ticket | ✅ | ❌ (Only own tickets) |
| Delete Tickets | ✅ | ❌ (Only own tickets) |
| Manage Users | ✅ | ❌ |
| Manage Teams | ✅ | ❌ |
| View Breached Tickets | ✅ | ✅ (Only assigned) |
| Dashboard Statistics | ✅ (All) | ✅ (Personal only) |

---

## Security Notes

- Role checks are enforced on both frontend and backend
- Users cannot access admin pages even with direct URL
- API endpoints validate user roles
- Protected routes check role before rendering
- All role-based filtering happens server-side in production
