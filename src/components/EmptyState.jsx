import { Box, Typography, Button } from '@mui/material';
import { Inbox, Add } from '@mui/icons-material';
import React from 'react';

const EmptyState = ({ 
  icon = <Inbox sx={{ fontSize: 64, color: 'text.secondary' }} />,
  title = 'No items found',
  description = 'Get started by creating your first item',
  actionLabel = 'Create New',
  onAction = null
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center'
      }}
    >
      <Box sx={{ mb: 2, opacity: 0.6 }}>
        {icon}
      </Box>
      <Typography variant="h5" fontWeight="medium" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {description}
      </Typography>
      {onAction && (
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAction}
          sx={{ borderRadius: 2 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
