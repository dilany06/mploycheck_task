import React, { useEffect, useState } from 'react';
import { Alert, Grid2, Paper, Typography } from '@mui/material';
import { api, getApiError } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';

const cards = [
  ['Total Leads', 'totalLeads'],
  ['Qualified Leads', 'qualifiedLeads'],
  ['Tasks Due Today', 'tasksDueToday'],
  ['Completed Tasks', 'completedTasks']
];

export default function DashboardPage() {
  const [summary, setSummary] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/summary').then(({ data }) => setSummary(data)).catch((err) => setError(getApiError(err)));
  }, []);

  return (
    <>
      <PageHeader title="Dashboard" />
      {error && <Alert severity="error">{error}</Alert>}
      <Grid2 container spacing={2}>
        {cards.map(([label, key]) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={key}>
            <Paper sx={{ p: 3 }}>
              <Typography color="text.secondary">{label}</Typography>
              <Typography variant="h3" fontWeight={800}>{summary[key] ?? 0}</Typography>
            </Paper>
          </Grid2>
        ))}
      </Grid2>
    </>
  );
}
