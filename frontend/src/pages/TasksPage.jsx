import React, { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip } from '@mui/material';
import { api, getApiError } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const initialTask = { title: '', description: '', lead: '', assignedTo: '', dueDate: '', status: 'Pending' };

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialTask);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchTasks = () => {
    api.get('/tasks').then(({ data }) => setTasks(data)).catch((err) => setError(getApiError(err)));
  };

  useEffect(() => {
    fetchTasks();
    Promise.all([api.get('/leads', { params: { limit: 50 } }), api.get('/users')])
      .then(([leadsRes, usersRes]) => {
        setLeads(leadsRes.data.items);
        setUsers(usersRes.data);
      })
      .catch((err) => setError(getApiError(err)));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/tasks', form);
      setForm(initialTask);
      setOpen(false);
      fetchTasks();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const markDone = async (task) => {
    try {
      await api.patch(`/tasks/${task._id}/status`, { status: 'Completed' });
      fetchTasks();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader title="Tasks" action={<Button startIcon={<AddIcon />} variant="contained" onClick={() => setOpen(true)}>Add Task</Button>} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Lead</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.lead?.name}</TableCell>
                <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>{task.assignedTo?.name}</TableCell>
                <TableCell align="right">
                  <Tooltip title={task.assignedTo?._id === user?.id ? 'Mark completed' : 'Only assigned user can update'}>
                    <span>
                      <IconButton color="success" disabled={task.status === 'Completed' || task.assignedTo?._id !== user?.id} onClick={() => markDone(task)}>
                        <DoneIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Task</DialogTitle>
        <DialogContent>
          <Stack component="form" id="task-form" spacing={2} sx={{ pt: 1 }} onSubmit={submit}>
            <TextField label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TextField label="Description" multiline minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <TextField label="Lead" select required value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })}>
              {leads.map((lead) => <MenuItem key={lead._id} value={lead._id}>{lead.name}</MenuItem>)}
            </TextField>
            <TextField label="Assign To" select required value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              {users.map((item) => <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>)}
            </TextField>
            <TextField label="Due Date" type="date" required InputLabelProps={{ shrink: true }} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            <TextField label="Status" select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {['Pending', 'In Progress', 'Completed'].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button form="task-form" type="submit" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
