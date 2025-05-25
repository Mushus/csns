import { APObject, ActivitySchema } from './types';
import { parse, ValiError } from 'valibot';
import { putItem } from '../lib/dynamodb';
import { APActorSchema } from '../schemas/actor'; // Import APActorSchema

// TODO: Make this configurable via environment variables
const ACTIVITYPUB_TABLE_NAME = 'ActivityPubTable';

/**
 * Processes an incoming ActivityPub activity from the inbox and stores it.
 *
 * @param activity The potential activity object.
 * @returns True if the activity is valid and processed successfully, false otherwise.
 */
export async function processInboxActivity(activity: APObject): Promise<boolean> {
  try {
    const parsedActivity = parse(ActivitySchema, activity);
    console.log("Processing activity:", parsedActivity.id);

    // Store the entire activity
    await putItem(ACTIVITYPUB_TABLE_NAME, parsedActivity as Record<string, any>);
    console.log(`Stored activity: ${parsedActivity.id}`);

    // Check and store the actor if it's an object with an id
    if (typeof parsedActivity.actor === 'object' && parsedActivity.actor !== null && 'id' in parsedActivity.actor) {
      // We need to ensure the actor object is flat for DynamoDB or handle nested structures appropriately.
      // For now, assuming parsedActivity.actor is a flat object suitable for DynamoDB.
      // Also, Valibot's parse on ActivitySchema should have validated the actor structure if it's an object.
      await putItem(ACTIVITYPUB_TABLE_NAME, parsedActivity.actor as Record<string, any>);
      console.log(`Stored actor: ${(parsedActivity.actor as { id: string }).id}`);
    } else if (typeof parsedActivity.actor === 'string') {
      // If actor is a string (URL), we might want to fetch and store it separately
      // For now, we are only storing embedded actor objects.
      console.log(`Actor is a string (URL), not storing separately: ${parsedActivity.actor}`);
    }

    // TODO: Differentiate activity types (Create, Follow, Like, Announce)
    // TODO: Based on type, perform specific actions (e.g., store data, send notifications)
    return true;
  } catch (error) {
    if (error instanceof ValiError) {
      console.error("Invalid activity:", error.issues);
    } else {
      // Log the error from putItem or other unexpected errors
      console.error("An unexpected error occurred during activity processing or storage:", error);
    }
    return false;
  }
}
