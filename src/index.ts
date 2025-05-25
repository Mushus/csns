import { Hono } from 'hono';
import { handle } from 'hono/adapter/aws-lambda';

export const app = new Hono(); // Export app

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

export const handler = handle(app);
