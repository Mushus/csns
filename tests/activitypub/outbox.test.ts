import { describe, it, expect, vi } from 'vitest';
import { sendActivity } from '../../src/activitypub/outbox';
import { APActor, APObject } from '../../src/activitypub/types'; // Included as requested

describe('sendActivity', () => {
  const mockActor: APActor = {
    id: 'https://example.com/users/sender',
    type: 'Person',
    inbox: 'https://example.com/users/sender/inbox',
    outbox: 'https://example.com/users/sender/outbox',
    name: 'Sender User',
  };

  const mockObject: APObject = {
    id: 'https://example.com/objects/message1',
    type: 'Note',
    content: 'Hello world!',
  };

  const targetUrl = 'https://target.example.com/inbox';

  // Test Case 1: Valid Activity
  it('should return true and log simulation message for a valid activity', async () => {
    const validActivity = {
      id: 'https://example.com/activities/post1',
      type: 'Create',
      actor: mockActor,
      object: mockObject,
      published: new Date().toISOString(),
    };

    const consoleLogSpy = vi.spyOn(console, 'log');
    const result = await sendActivity(validActivity as APObject, targetUrl);

    expect(result).toBe(true);
    expect(consoleLogSpy).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(`Simulating sending activity: ${validActivity.id} to ${targetUrl}`);

    consoleLogSpy.mockRestore();
  });

  // Test Case 2: Invalid Activity (Missing Object)
  it('should return false and log error for an invalid activity (missing object)', async () => {
    const invalidActivityMissingObject = {
      id: 'https://example.com/activities/invalid1',
      type: 'Create',
      actor: mockActor,
      // object: mockObject, // Object is missing
      published: new Date().toISOString(),
    };

    const consoleErrorSpy = vi.spyOn(console, 'error');
    const result = await sendActivity(invalidActivityMissingObject as APObject, targetUrl);

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
    // Check if the error message indicates issues related to 'object' field
    expect(consoleErrorSpy).toHaveBeenCalledWith("Invalid activity for outbox:", expect.arrayContaining([
      expect.objectContaining({
        path: expect.arrayContaining([expect.objectContaining({ key: 'object' })]),
      }),
    ]));

    consoleErrorSpy.mockRestore();
  });

  // Test Case 3: Invalid Activity (Actor is not a valid AP Actor or URL string)
  it('should return false and log error for an invalid activity (invalid actor type)', async () => {
    const invalidActivityInvalidActor = {
      id: 'https://example.com/activities/invalid2',
      type: 'Create',
      actor: { name: "Just a name", type: "Invalid" }, // Not a valid APActor or URL
      object: mockObject,
      published: new Date().toISOString(),
    };
    
    const consoleErrorSpy = vi.spyOn(console, 'error');
    const result = await sendActivity(invalidActivityInvalidActor as APObject, targetUrl);

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Invalid activity for outbox:", expect.arrayContaining([
      expect.objectContaining({
        path: expect.arrayContaining([expect.objectContaining({ key: 'actor' })]),
      }),
    ]));
    consoleErrorSpy.mockRestore();
  });
});
