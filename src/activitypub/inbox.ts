import { APObject, ActivitySchema } from './types';
import { parse, ValiError } from 'valibot';

/**
 * Processes an incoming ActivityPub activity from the inbox.
 *
 * @param activity The potential activity object.
 * @returns True if the activity is valid and processed, false otherwise.
 */
export function processInboxActivity(activity: APObject): boolean {
  try {
    const parsedActivity = parse(ActivitySchema, activity);
    // TODO: Differentiate activity types (Create, Follow, Like, Announce)
    // TODO: Based on type, perform specific actions (e.g., store data, send notifications)
    console.log("Processing activity:", parsedActivity);
    return true;
  } catch (error) {
    if (error instanceof ValiError) {
      console.error("Invalid activity:", error.issues);
    } else {
      console.error("An unexpected error occurred during activity processing:", error);
    }
    return false;
  }
}
