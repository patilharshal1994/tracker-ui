# Issue Tracker Frontend

Modern React application for the Issue Tracker built with Vite, Material UI, and React Router.

## Features

- Clean, professional UI with Material UI
- Responsive design
- Role-based navigation
- Real-time ticket management
- Project and team management (Admin)
- Ticket filtering and search
- Comment system with image attachments

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Update `VITE_API_URL` if your API is running on a different port.

3. **Start development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
  ├── components/      # Reusable components
  ├── config/         # API configuration
  ├── context/        # React context (Auth)
  ├── pages/          # Page components
  └── App.jsx         # Main app component
```

## Pages

- **Login** - User authentication
- **Dashboard** - Overview with statistics
- **Projects** - Project list and management
- **Tickets** - Ticket list with filters
- **Ticket Detail** - Individual ticket view with comments

## Default Credentials

- Admin: `admin@tracker.com` / `password123`
- User1: `user1@tracker.com` / `password123`
- User2: `user2@tracker.com` / `password123`
