import { APObject, ActivitySchema } from './types';
import { parse, ValiError } from 'valibot';

/**
 * Parses and "sends" an ActivityPub activity to a target URL.
 * Currently, it only simulates sending by logging to the console.
 *
 * @param activity The activity object to send.
 * @param targetUrl The URL of the target inbox.
 * @returns A promise that resolves to true if the activity is valid and "sent" (simulated),
 *          and false if the activity is invalid or an error occurs.
 */
export async function sendActivity(activity: APObject, targetUrl: string): Promise<boolean> {
  try {
    const parsedActivity = parse(ActivitySchema, activity);
    console.log(`Simulating sending activity: ${parsedActivity.id} to ${targetUrl}`);
    // TODO: Implement actual HTTP POST request logic here.
    // This will involve using a fetch-like library to send `parsedActivity`
    // as JSON to the `targetUrl` with appropriate headers (e.g., Content-Type: application/activity+json).
    return true;
  } catch (error) {
    if (error instanceof ValiError) {
      console.error("Invalid activity for outbox:", error.issues);
    } else {
      console.error("An unexpected error occurred while preparing to send activity:", error);
    }
    return false;
  }
}
