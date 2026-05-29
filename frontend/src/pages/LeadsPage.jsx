import React, { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Alert, Box, Button, IconButton, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { api, getApiError } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';

const statuses = ['', 'New', 'Contacted', 'Qualified', 'Lost'];
const pageWindowSize = 3;

function getVisiblePages(currentPage, totalPages) {
  const pages = Math.max(totalPages, pageWindowSize);
  const start = Math.min(Math.max(currentPage - 1, 1), Math.max(pages - pageWindowSize + 1, 1));
  return Array.from({ length: pageWindowSize }, (_, index) => start + index);
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 });
  const [error, setError] = useState('');

  const fetchLeads = () => {
    api.get('/leads', { params: { ...filters, limit: 10 } })
      .then(({ data }) => {
        setLeads(data.items);
        setMeta({ page: data.page, pages: data.pages, total: data.total });
      })
      .catch((err) => setError(getApiError(err)));
  };

  useEffect(fetchLeads, [filters]);

  const removeLead = async (id) => {
    await api.delete(`/leads/${id}`);
    fetchLeads();
  };

  const goToPage = (page) => {
    setFilters({ ...filters, page });
  };

  const visiblePages = getVisiblePages(meta.page, meta.pages);

  return (
    <>
      <PageHeader title="Leads" action={<Button component={RouterLink} to="/leads/new" variant="contained" startIcon={<AddIcon />}>Add Lead</Button>} />
      <Paper sx={{ p: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField label="Search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} size="small" />
          <TextField label="Status" select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })} size="small" sx={{ minWidth: 180 }}>
            {statuses.map((status) => <MenuItem key={status || 'all'} value={status}>{status || 'All'}</MenuItem>)}
          </TextField>
        </Stack>
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead._id}>
                  <TableCell>{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.status}</TableCell>
                  <TableCell>{lead.assignedTo?.name}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton component={RouterLink} to={`/leads/${lead._id}/edit`}><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton color="error" onClick={() => removeLead(lead._id)}><DeleteIcon /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button size="small" variant="outlined" disabled={meta.page <= 1} onClick={() => goToPage(meta.page - 1)}>
            &lt;
          </Button>
          {visiblePages.map((page) => (
            <Button
              key={page}
              size="small"
              variant={page === meta.page ? 'contained' : 'outlined'}
              disabled={page > meta.pages}
              onClick={() => goToPage(page)}
              sx={{ minWidth: 36 }}
            >
              {page}
            </Button>
          ))}
          <Button size="small" variant="outlined" disabled={meta.page >= meta.pages} onClick={() => goToPage(meta.page + 1)}>
            &gt;
          </Button>
        </Stack>
      </Paper>
    </>
  );
}
