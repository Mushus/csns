import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processInboxActivity } from './inbox'; // Adjust path if needed
import { APObject } from './types'; // Import the type

// Mock the dynamodb module
const mockPutItem = vi.fn();
vi.mock('../lib/dynamodb', () => ({
  putItem: mockPutItem,
}));

describe('processInboxActivity', () => {
  beforeEach(() => {
    mockPutItem.mockReset();
    vi.spyOn(console, 'log').mockImplementation(() => {}); // Suppress console.log
    vi.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });

  const validActivityBase: APObject = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    id: 'https://example.com/activity/1',
    type: 'Create',
    actor: 'https://example.com/actor/1',
    object: {
      id: 'https://example.com/object/1',
      type: 'Note',
      content: 'Hello world',
    },
  };

  const actorObject = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    id: 'https://example.com/actor/1',
    type: 'Person',
    name: 'Test Actor',
  };

  it('should return true and store activity when actor is a string URL', async () => {
    mockPutItem.mockResolvedValue(undefined); // putItem resolves successfully
    const activity = { ...validActivityBase };

    const result = await processInboxActivity(activity);

    expect(result).toBe(true);
    expect(mockPutItem).toHaveBeenCalledTimes(1);
    expect(mockPutItem).toHaveBeenCalledWith('ActivityPubTable', activity);
  });

  it('should return true and store activity and actor object when actor is an object', async () => {
    mockPutItem.mockResolvedValue(undefined);
    const activityWithActorObject = {
      ...validActivityBase,
      actor: actorObject,
    };

    const result = await processInboxActivity(activityWithActorObject);

    expect(result).toBe(true);
    expect(mockPutItem).toHaveBeenCalledTimes(2);
    expect(mockPutItem).toHaveBeenCalledWith('ActivityPubTable', activityWithActorObject);
    expect(mockPutItem).toHaveBeenCalledWith('ActivityPubTable', actorObject);
  });

  it('should return false for an invalid activity (e.g., missing type)', async () => {
    const invalidActivity = { ...validActivityBase, type: undefined } as unknown as APObject;

    const result = await processInboxActivity(invalidActivity);

    expect(result).toBe(false);
    expect(mockPutItem).not.toHaveBeenCalled();
  });

  it('should return false for an invalid activity (e.g., missing id)', async () => {
    const invalidActivity = { ...validActivityBase, id: undefined } as unknown as APObject;

    const result = await processInboxActivity(invalidActivity);

    expect(result).toBe(false);
    expect(mockPutItem).not.toHaveBeenCalled();
  });


  it('should return false if storing the activity fails', async () => {
    mockPutItem.mockRejectedValueOnce(new Error('Failed to store activity'));
    const activity = { ...validActivityBase };

    const result = await processInboxActivity(activity);

    expect(result).toBe(false);
    expect(mockPutItem).toHaveBeenCalledTimes(1);
    expect(mockPutItem).toHaveBeenCalledWith('ActivityPubTable', activity);
  });

  it('should return false if storing the actor object fails', async () => {
    const activityWithActorObject = {
      ...validActivityBase,
      actor: actorObject,
    };
    mockPutItem
      .mockResolvedValueOnce(undefined) // First call (activity) succeeds
      .mockRejectedValueOnce(new Error('Failed to store actor')); // Second call (actor) fails

    const result = await processInboxActivity(activityWithActorObject);

    expect(result).toBe(false);
    expect(mockPutItem).toHaveBeenCalledTimes(2);
    expect(mockPutItem).toHaveBeenCalledWith('ActivityPubTable', activityWithActorObject);
    expect(mockPutItem).toHaveBeenCalledWith('ActivityPubTable', actorObject);
  });

  it('should handle activity where actor is null gracefully', async () => {
    mockPutItem.mockResolvedValue(undefined);
    const activityWithNullActor = {
        ...validActivityBase,
        actor: null as any, // Test case for null actor
    };

    const result = await processInboxActivity(activityWithNullActor);
    expect(result).toBe(true); // Still true as the activity itself is valid and stored
    expect(mockPutItem).toHaveBeenCalledTimes(1);
    expect(mockPutItem).toHaveBeenCalledWith('ActivityPubTable', activityWithNullActor);
  });

  it('should handle activity where actor is an object but without an id', async () => {
    mockPutItem.mockResolvedValue(undefined);
    const actorWithoutId = { type: 'Person', name: 'Anonymous' };
    const activityWithActorWithoutId = {
        ...validActivityBase,
        actor: actorWithoutId as any, // Actor object missing 'id'
    };

    const result = await processInboxActivity(activityWithActorWithoutId);
    expect(result).toBe(true); // Still true as the activity itself is valid and stored
    expect(mockPutItem).toHaveBeenCalledTimes(1); // Only activity should be stored
    expect(mockPutItem).toHaveBeenCalledWith('ActivityPubTable', activityWithActorWithoutId);
  });
});
