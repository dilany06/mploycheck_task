import React from 'react';
import { Box, Typography } from '@mui/material';

export default function PageHeader({ title, action }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2 }}>
      <Typography variant="h4" fontWeight={700}>
        {title}
      </Typography>
      {action}
    </Box>
  );
}
