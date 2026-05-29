import React, { useEffect, useState } from 'react';
import { Alert, Button, MenuItem, Paper, Stack, TextField } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { api, getApiError } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';

const statuses = ['New', 'Contacted', 'Qualified', 'Lost'];
const initialForm = { name: '', email: '', phone: '', status: 'New', assignedTo: '', company: '' };

export default function LeadFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/companies')])
      .then(([usersRes, companiesRes]) => {
        setUsers(usersRes.data);
        setCompanies(companiesRes.data);
      })
      .catch((err) => setError(getApiError(err)));
  }, []);

  useEffect(() => {
    if (!id) return;
    api.get(`/leads/${id}`).then(({ data }) => setForm({
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: data.status,
      assignedTo: data.assignedTo?._id || '',
      company: data.company?._id || ''
    })).catch((err) => setError(getApiError(err)));
  }, [id]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (id) await api.put(`/leads/${id}`, form);
      else await api.post('/leads', form);
      navigate('/leads');
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader title={id ? 'Edit Lead' : 'Add Lead'} />
      <Paper sx={{ p: 3, maxWidth: 760 }}>
        <Stack component="form" spacing={2} onSubmit={submit}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <TextField label="Status" select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {statuses.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
          </TextField>
          <TextField label="Assigned To" select required value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
            {users.map((user) => <MenuItem key={user._id} value={user._id}>{user.name}</MenuItem>)}
          </TextField>
          <TextField label="Company" select required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}>
            {companies.map((company) => <MenuItem key={company._id} value={company._id}>{company.name}</MenuItem>)}
          </TextField>
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained">Save</Button>
            <Button variant="outlined" onClick={() => navigate('/leads')}>Cancel</Button>
          </Stack>
        </Stack>
      </Paper>
    </>
  );
}
