import React, { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { api, getApiError } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';

const initialCompany = { name: '', industry: '', location: '', website: '' };

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(initialCompany);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchCompanies = () => {
    api.get('/companies').then(({ data }) => setCompanies(data)).catch((err) => setError(getApiError(err)));
  };

  useEffect(fetchCompanies, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/companies', form);
      setForm(initialCompany);
      setOpen(false);
      fetchCompanies();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader title="Companies" action={<Button startIcon={<AddIcon />} variant="contained" onClick={() => setOpen(true)}>Add Company</Button>} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company Name</TableCell>
              <TableCell>Industry</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company._id} hover component={RouterLink} to={`/companies/${company._id}`} sx={{ textDecoration: 'none' }}>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.industry}</TableCell>
                <TableCell>{company.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Company</DialogTitle>
        <DialogContent>
          <Stack component="form" id="company-form" spacing={2} sx={{ pt: 1 }} onSubmit={submit}>
            <TextField label="Company Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Industry" required value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            <TextField label="Location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <TextField label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button form="company-form" type="submit" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
