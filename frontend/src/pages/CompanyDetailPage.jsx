import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { api, getApiError } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';

export default function CompanyDetailPage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/companies/${id}`).then(({ data }) => {
      setCompany(data.company);
      setLeads(data.leads);
    }).catch((err) => setError(getApiError(err)));
  }, [id]);

  return (
    <>
      <PageHeader title="Company Details" action={<Button component={RouterLink} to="/companies" variant="outlined">Back</Button>} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {company && (
        <Stack spacing={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={700}>{company.name}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip label={company.industry} />
              <Chip label={company.location} variant="outlined" />
            </Stack>
            {company.website && <Typography sx={{ mt: 2 }}>{company.website}</Typography>}
          </Paper>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Associated Leads</Typography>
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned To</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead._id}>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.status}</TableCell>
                      <TableCell>{lead.assignedTo?.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        </Stack>
      )}
    </>
  );
}
