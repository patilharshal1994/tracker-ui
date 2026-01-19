import { Skeleton, Box, Paper } from '@mui/material';
import React from 'react';

export const TicketListSkeleton = () => {
  return (
    <Paper sx={{ p: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Box key={i} sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Skeleton variant="rectangular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
          <Skeleton variant="rectangular" width={80} height={32} />
        </Box>
      ))}
    </Paper>
  );
};

export const TicketDetailSkeleton = () => {
  return (
    <Box>
      <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="100%" height={24} />
      <Skeleton variant="text" width="80%" height={24} />
    </Box>
  );
};

export default TicketListSkeleton;
