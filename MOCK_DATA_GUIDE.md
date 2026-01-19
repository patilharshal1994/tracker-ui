# Mock Data Development Guide

## Overview
The application is now configured to use **mock data** instead of requiring a backend API. This allows you to test all pages and flows without setting up the database.

## Configuration

### Enable/Disable Mock Data
To toggle between mock data and real API:

1. **In `src/data/mockData.js`:**
   ```javascript
   export const USE_MOCK_DATA = true;  // Set to false to use real API
   ```

2. **In `src/components/ProtectedRoute.jsx`:**
   ```javascript
   const BYPASS_AUTH = true;  // Set to false to require login
   ```

## What's Available

### Pages (All Accessible Without Login)
- ✅ **Dashboard** - `/dashboard` - Shows ticket statistics
- ✅ **Projects** - `/projects` - List of projects
- ✅ **Tickets** - `/tickets` - List of tickets with filters
- ✅ **Ticket Detail** - `/tickets/:id` - Individual ticket view
- ✅ **Users** - `/users` - User management (Admin only)
- ✅ **Teams** - `/teams` - Team management (Admin only)
- ✅ **Login** - `/login` - Login page (still works)

### Mock Data Includes
- **3 Users** (1 Admin, 2 Regular Users)
- **2 Teams** (Development Team, QA Team)
- **2 Projects** (Website Redesign, Mobile App)
- **7 Tickets** (Various statuses, priorities, with comments)
- **1 Breached Ticket** (For testing SLA alerts)

### Current User
When using mock data, you're automatically logged in as:
- **Name:** Admin User
- **Email:** admin@tracker.com
- **Role:** ADMIN

## Testing Features

### Dashboard
- View assigned/reported tickets
- See breached tickets alert
- View statistics by status

### Projects
- View all projects
- See project details
- View project members

### Tickets
- Filter by status, priority
- View "Assigned to Me" / "Reported by Me"
- Create new tickets (UI only, won't persist)
- View ticket details

### Ticket Detail
- View full ticket information
- See comments
- Add comments (UI only)
- Edit ticket status/priority

### Users & Teams (Admin)
- View all users/teams
- See team members
- Create/edit/delete (UI only)

## Switching to Real API

When ready to connect to the backend:

1. Set `USE_MOCK_DATA = false` in `src/data/mockData.js`
2. Set `BYPASS_AUTH = false` in `src/components/ProtectedRoute.jsx`
3. Make sure backend is running on `http://localhost:3001`
4. Update `.env` file with correct API URL

## Notes

- Mock data is stored in memory and resets on page refresh
- Create/Update/Delete operations show UI feedback but don't persist
- All API calls are simulated with a 500ms delay
- Filtering and search work with mock data
