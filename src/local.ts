import { app } from './index';
import { serve } from '@hono/node-server';

// Development-specific routes
app.get('/dev/test', (c) => {
  return c.json({ message: "This is a local dev endpoint" });
});

const port = 3000;

console.log(`Local server will attempt to run on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port: port
}, (info) => {
  console.log(`Local server running on http://localhost:${info.port}`);
});
