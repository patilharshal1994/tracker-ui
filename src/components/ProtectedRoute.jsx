import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import React from 'react'

// Set to true to bypass authentication for development
const BYPASS_AUTH = true;

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  // Bypass auth for development
  if (BYPASS_AUTH) {
    return children;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
