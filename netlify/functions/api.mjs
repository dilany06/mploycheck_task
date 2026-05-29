import serverless from 'serverless-http';
import { app } from '../../backend/src/app.js';
import { connectDb } from '../../backend/src/config/db.js';

let cachedHandler;

async function getHandler() {
  if (!cachedHandler) {
    await connectDb();
    cachedHandler = serverless(app);
  }

  return cachedHandler;
}

export async function handler(event, context) {
  const serverlessHandler = await getHandler();
  const normalizedEvent = { ...event };

  if (normalizedEvent.path?.startsWith('/.netlify/functions/api/')) {
    const suffix = normalizedEvent.path.replace('/.netlify/functions/api/', '');
    normalizedEvent.path = `/api/${suffix}`;
  } else if (normalizedEvent.path && !normalizedEvent.path.startsWith('/api')) {
    normalizedEvent.path = `/api${normalizedEvent.path}`;
  }

  return serverlessHandler(normalizedEvent, context);
}
