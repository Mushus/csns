import { describe, it, expect, vi } from 'vitest';
import { processInboxActivity } from '../../src/activitypub/inbox';
import { APActor, APObject } from '../../src/activitypub/types'; // Included as requested

describe('processInboxActivity', () => {
  const mockActor: APActor = {
    id: 'https://example.com/users/testuser',
    type: 'Person',
    inbox: 'https://example.com/users/testuser/inbox',
    outbox: 'https://example.com/users/testuser/outbox',
    name: 'Test User',
  };

  const mockObject: APObject = {
    id: 'https://example.com/objects/note1',
    type: 'Note',
    content: 'This is a test note.',
  };

  // Test Case 1: Valid Activity
  it('should return true and log the activity for a valid activity', () => {
    const validActivity = {
      id: 'https://example.com/activities/create1',
      type: 'Create',
      actor: mockActor,
      object: mockObject,
      published: new Date().toISOString(),
    };

    const consoleLogSpy = vi.spyOn(console, 'log');
    const result = processInboxActivity(validActivity as APObject); // Cast as APObject for input

    expect(result).toBe(true);
    expect(consoleLogSpy).toHaveBeenCalled();
    // Check if the logged message contains the activity's ID (or a more specific check if needed)
    expect(consoleLogSpy).toHaveBeenCalledWith("Processing activity:", expect.objectContaining({ id: validActivity.id }));

    consoleLogSpy.mockRestore();
  });

  // Test Case 2: Invalid Activity (Missing Actor)
  it('should return false and log an error for an activity missing the actor field', () => {
    const invalidActivityMissingActor = {
      id: 'https://example.com/activities/invalid2',
      type: 'Create',
      // actor: mockActor, // Actor is missing
      object: mockObject,
      published: new Date().toISOString(),
    };

    const consoleErrorSpy = vi.spyOn(console, 'error');
    const result = processInboxActivity(invalidActivityMissingActor as APObject);

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
    // Check if the error message indicates issues (Valibot's specific error structure)
    expect(consoleErrorSpy).toHaveBeenCalledWith("Invalid activity:", expect.any(Array));

    consoleErrorSpy.mockRestore();
  });

  // Test Case 3: Invalid Activity (Wrong Type for a field)
  it('should return false and log an error for an activity with a field of an incorrect type', () => {
    const invalidActivityWrongFieldType = {
      id: 'https://example.com/activities/invalid3',
      type: 'Like',
      actor: mockActor,
      object: 12345, // Object should be an APObject or a URL string, not a number
      published: new Date().toISOString(),
    };

    const consoleErrorSpy = vi.spyOn(console, 'error');
    const result = processInboxActivity(invalidActivityWrongFieldType as APObject);

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Invalid activity:", expect.any(Array));

    consoleErrorSpy.mockRestore();
  });
});
