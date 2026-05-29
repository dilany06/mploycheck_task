import React, { useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { getApiError } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.email || !form.password || (mode === 'signup' && !form.name)) {
      setError(mode === 'signup' ? 'Name, email, and password are required' : 'Email and password are required');
      return;
    }

    try {
      setLoading(true);
      if (mode === 'signup') await signup(form.name, form.email, form.password);
      else await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 2 }}>
      <Paper sx={{ width: '100%', maxWidth: 420, p: 4 }} elevation={3}>
        <Stack component="form" spacing={2.5} onSubmit={submit}>
          <Typography variant="h4" textAlign="center" fontWeight={800}>MINI CRM</Typography>
          <Typography color="text.secondary" textAlign="center">
            {mode === 'signup' ? 'Create your account' : 'Sign in to your account'}
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {mode === 'signup' && (
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required fullWidth />
          )}
          <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required fullWidth />
          <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required fullWidth />
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {mode === 'signup' ? 'Sign Up' : 'Login'}
          </Button>
          <Button
            type="button"
            variant="text"
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup');
              setError('');
            }}
          >
            {mode === 'signup' ? 'Already have an account? Login' : 'New user? Create an account'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
