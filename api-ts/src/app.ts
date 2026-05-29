import cors from 'cors';
import express from 'express';
import { artificialDelay } from './middleware/delay';
import { authRoutes } from './routes/authRoutes';
import { recordRoutes } from './routes/recordRoutes';
import { userRoutes } from './routes/userRoutes';

export const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:4200' }));
app.use(express.json());
app.use(artificialDelay);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', storage: 'local-xml' });
});

app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/users', userRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ message: err.message || 'Unexpected API error' });
});
