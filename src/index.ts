import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { processInboxActivity } from './activitypub/inbox';
import { APObject } from './activitypub/types'; // For type casting

const app = new Hono();

app.post('/', async (c) => {
  console.log('Received POST request to /');

  let body;
  try {
    body = await c.req.json<APObject>(); // Attempt to parse and type the body
    if (!body) {
      console.warn('Request body is null or undefined after parsing.');
      return c.json({ message: 'Invalid request: Missing or empty body' }, 400);
    }
    console.log('Parsed request body:', body);
  } catch (error) {
    console.error('Error parsing JSON body:', error);
    return c.json({ message: 'Invalid request: Malformed JSON', error: (error as Error).message }, 400);
  }

  try {
    // The `body` is already parsed, pass it directly.
    // `processInboxActivity` will perform its own validation using Valibot.
    const success = await processInboxActivity(body);

    if (success) {
      console.log('Activity processed successfully by processInboxActivity.');
      return c.json({ message: 'Activity received and processing initiated' }, 202);
    } else {
      // This case implies processInboxActivity handled its own error logging
      // but indicated failure to the caller.
      console.error('processInboxActivity returned false, indicating an error during processing.');
      return c.json({ message: 'Error processing activity' }, 500);
    }
  } catch (error) {
    // This catches unexpected errors thrown by processInboxActivity itself (e.g., unhandled exceptions)
    console.error('Unexpected error during processInboxActivity execution:', error);
    return c.json({ message: 'Unexpected internal server error', error: (error as Error).message }, 500);
  }
});

// Optional: Add a health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', message: 'Hono app is running' });
});

export const handler = handle(app);
