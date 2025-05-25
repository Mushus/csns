import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import {
  APObjectSchema,
  APActorSchema,
  ActivitySchema,
  CreateActivitySchema,
  FollowActivitySchema,
  LikeActivitySchema,
  AnnounceActivitySchema,
  WebFingerLinkSchema,
  WebFingerSchema,
} from '../../src/activitypub/types';

// Base objects for reusability
const baseObject: v.Input<typeof APObjectSchema> = {
  id: 'https://example.com/object/1',
  type: 'Note',
  content: 'This is a test note.',
  published: new Date().toISOString(),
};

const baseActor: v.Input<typeof APActorSchema> = {
  id: 'https://example.com/users/testactor',
  type: 'Person',
  name: 'Test Actor',
  inbox: 'https://example.com/users/testactor/inbox',
  outbox: 'https://example.com/users/testactor/outbox',
  preferredUsername: 'testactor',
};

const baseActivity = {
  id: 'https://example.com/activity/1',
  type: 'Activity', // Generic type for base, will be overridden
  actor: baseActor,
  object: baseObject,
  published: new Date().toISOString(),
};

describe('ActivityPub Valibot Schemas', () => {
  describe('APObjectSchema', () => {
    it('should validate a correct APObject', () => {
      const validObject = {
        id: 'https://example.com/object/1',
        type: 'Note',
        name: 'My Note',
        content: 'This is a note.',
        published: new Date().toISOString(),
        to: ['https://example.com/users/main'],
        cc: ['https://example.com/followers/main']
      };
      expect(() => v.parse(APObjectSchema, validObject)).not.toThrow();
    });

    it('should invalidate an APObject missing id', () => {
      const invalidObject = { type: 'Note' };
      expect(() => v.parse(APObjectSchema, invalidObject)).toThrow();
    });

    it('should invalidate an APObject with invalid id (not a URL)', () => {
      const invalidObject = { id: 'not-a-url', type: 'Note' };
      expect(() => v.parse(APObjectSchema, invalidObject)).toThrow();
    });
  });

  describe('APActorSchema', () => {
    it('should validate a correct APActor', () => {
      const validActor = {
        id: 'https://example.com/users/actor',
        type: 'Person',
        name: 'Actor Name',
        inbox: 'https://example.com/users/actor/inbox',
        outbox: 'https://example.com/users/actor/outbox',
        preferredUsername: 'actor'
      };
      expect(() => v.parse(APActorSchema, validActor)).not.toThrow();
    });

    it('should invalidate an APActor missing inbox', () => {
      const invalidActor = {
        id: 'https://example.com/users/actor',
        type: 'Person',
        outbox: 'https://example.com/users/actor/outbox',
      };
      expect(() => v.parse(APActorSchema, invalidActor)).toThrow();
    });

    it('should invalidate an APActor with invalid inbox (not a URL)', () => {
      const invalidActor = {
        id: 'https://example.com/users/actor',
        type: 'Person',
        inbox: 'not-a-url',
        outbox: 'https://example.com/users/actor/outbox',
      };
      expect(() => v.parse(APActorSchema, invalidActor)).toThrow();
    });
  });

  describe('ActivitySchema', () => {
    it('should validate a correct Activity with actor and object as full objects', () => {
      const validActivity = { ...baseActivity, type: 'Activity' };
      const result = v.safeParse(ActivitySchema, validActivity);
      expect(result.success).toBe(true);
    });

    it('should validate a correct Activity with actor and object as URLs', () => {
      const validActivity = {
        ...baseActivity,
        type: 'Activity',
        actor: 'https://example.com/users/actor-url',
        object: 'https://example.com/objects/object-url',
      };
      const result = v.safeParse(ActivitySchema, validActivity);
      expect(result.success).toBe(true);
    });

    it('should validate a correct Activity with actor as object and object as URL', () => {
      const validActivity = {
        ...baseActivity,
        type: 'Activity',
        actor: baseActor,
        object: 'https://example.com/objects/object-url',
      };
      const result = v.safeParse(ActivitySchema, validActivity);
      expect(result.success).toBe(true);
    });

    it('should validate a correct Activity with actor as URL and object as object', () => {
      const validActivity = {
        ...baseActivity,
        type: 'Activity',
        actor: 'https://example.com/users/actor-url',
        object: baseObject,
      };
      const result = v.safeParse(ActivitySchema, validActivity);
      expect(result.success).toBe(true);
    });

    it('should invalidate an Activity missing actor', () => {
      const invalidActivity = { ...baseActivity, actor: undefined, type: 'Activity' };
      const result = v.safeParse(ActivitySchema, invalidActivity);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('actor');
    });

    it('should invalidate an Activity missing object', () => {
      const invalidActivity = { ...baseActivity, object: undefined, type: 'Activity' };
      const result = v.safeParse(ActivitySchema, invalidActivity);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('object');
    });

    it('should invalidate an Activity with actor as invalid type (not Actor or URL)', () => {
      const invalidActivity = { ...baseActivity, actor: { id: 'foo' }, type: 'Activity' }; // missing actor fields
      const result = v.safeParse(ActivitySchema, invalidActivity);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('actor');
    });

    it('should invalidate an Activity with object as invalid type (not APObject or URL)', () => {
      const invalidActivity = { ...baseActivity, object: { name: 'only name' }, type: 'Activity' }; // missing object id/type
      const result = v.safeParse(ActivitySchema, invalidActivity);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('object');
    });
  });

  describe('CreateActivitySchema', () => {
    const validCreateActivity = {
      ...baseActivity,
      type: 'Create' as const, // Ensure literal type
    };

    it('should validate a correct CreateActivity', () => {
      const result = v.safeParse(CreateActivitySchema, validCreateActivity);
      expect(result.success).toBe(true);
    });

    it('should invalidate a CreateActivity with incorrect type', () => {
      const invalidActivity = { ...validCreateActivity, type: 'Like' as const };
      const result = v.safeParse(CreateActivitySchema, invalidActivity);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('type');
    });

    it('should invalidate a CreateActivity missing type', () => {
      const { type, ...rest } = validCreateActivity; // remove type
      const invalidActivity = rest;
      const result = v.safeParse(CreateActivitySchema, invalidActivity);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('type');
    });


    it('should invalidate a CreateActivity missing actor', () => {
      const invalidActivity = { ...validCreateActivity, actor: undefined };
      const result = v.safeParse(CreateActivitySchema, invalidActivity);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('actor');
    });

    it('should invalidate a CreateActivity missing object', () => {
      const invalidActivity = { ...validCreateActivity, object: undefined };
      const result = v.safeParse(CreateActivitySchema, invalidActivity);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('object');
    });
  });

  describe('FollowActivitySchema', () => {
    const validFollowActivityBase = {
      ...baseActivity,
      actor: baseActor, // follower
      type: 'Follow' as const,
    };

    it('should validate a correct FollowActivity with object as APActorSchema', () => {
      const validActivity = { ...validFollowActivityBase, object: baseActor }; // following baseActor
      const result = v.safeParse(FollowActivitySchema, validActivity);
      expect(result.success).toBe(true);
    });

    it('should validate a correct FollowActivity with object as URL string', () => {
      const validActivity = { ...validFollowActivityBase, object: 'https://example.com/users/tobefollowed' };
      const result = v.safeParse(FollowActivitySchema, validActivity);
      expect(result.success).toBe(true);
    });

    it('should invalidate a FollowActivity with incorrect type', () => {
      const invalidActivity = { ...validFollowActivityBase, object: baseActor, type: 'Like' as const };
      const result = v.safeParse(FollowActivitySchema, invalidActivity);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('type');
    });

    it('should invalidate a FollowActivity with object as APObject (not Actor or URL)', () => {
      const invalidActivity = { ...validFollowActivityBase, object: baseObject }; // Trying to follow a Note
      const result = v.safeParse(FollowActivitySchema, invalidActivity);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('object');
    });

    it('should invalidate a FollowActivity with object as invalid type', () => {
      const invalidActivity = { ...validFollowActivityBase, object: { id: 'foo' } }; // Not a valid Actor or URL
      const result = v.safeParse(FollowActivitySchema, invalidActivity);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('object');
    });

    it('should invalidate a FollowActivity missing object', () => {
        const invalidActivity = { ...validFollowActivityBase, object: undefined };
        const result = v.safeParse(FollowActivitySchema, invalidActivity);
        expect(result.success).toBe(false);
        expect(result.issues?.[0].path?.[0].key).toBe('object');
    });
  });

  describe('LikeActivitySchema', () => {
    const validLikeActivity = {
      ...baseActivity,
      type: 'Like' as const,
      object: baseObject, // Liking a Note
    };

    it('should validate a correct LikeActivity', () => {
      const result = v.safeParse(LikeActivitySchema, validLikeActivity);
      expect(result.success).toBe(true);
    });

    it('should invalidate a LikeActivity with incorrect type', () => {
      const invalidActivity = { ...validLikeActivity, type: 'Create' as const };
      const result = v.safeParse(LikeActivitySchema, invalidActivity);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('type');
    });

    it('should invalidate a LikeActivity missing object', () => {
      const invalidActivity = { ...validLikeActivity, object: undefined };
      const result = v.safeParse(LikeActivitySchema, invalidActivity);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('object');
    });
  });

  describe('AnnounceActivitySchema', () => {
    const validAnnounceActivity = {
      ...baseActivity,
      type: 'Announce' as const,
      object: baseObject, // Announcing a Note
    };

    it('should validate a correct AnnounceActivity', () => {
      const result = v.safeParse(AnnounceActivitySchema, validAnnounceActivity);
      expect(result.success).toBe(true);
    });

    it('should invalidate an AnnounceActivity with incorrect type', () => {
      const invalidActivity = { ...validAnnounceActivity, type: 'Like' as const };
      const result = v.safeParse(AnnounceActivitySchema, invalidActivity);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('type');
    });

    it('should invalidate an AnnounceActivity missing object', () => {
      const invalidActivity = { ...validAnnounceActivity, object: undefined };
      const result = v.safeParse(AnnounceActivitySchema, invalidActivity);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('object');
    });
  });
});

describe('WebFinger Schemas', () => {
  describe('WebFingerLinkSchema', () => {
    it('should validate a correct WebFingerLink with all fields', () => {
      const validLink = {
        rel: 'profile',
        type: 'application/activity+json',
        href: 'https://example.com/users/profile',
      };
      const result = v.safeParse(WebFingerLinkSchema, validLink);
      expect(result.success).toBe(true);
    });

    it('should validate a correct WebFingerLink with only rel (minimal)', () => {
      const validLink = { rel: 'self' };
      const result = v.safeParse(WebFingerLinkSchema, validLink);
      expect(result.success).toBe(true);
    });

    it('should invalidate a WebFingerLink missing rel', () => {
      const invalidLink = { type: 'application/activity+json', href: 'https://example.com/users/profile' };
      const result = v.safeParse(WebFingerLinkSchema, invalidLink);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('rel');
    });

    it('should invalidate a WebFingerLink with href not being a URL', () => {
      const invalidLink = { rel: 'profile', href: 'not-a-url' };
      const result = v.safeParse(WebFingerLinkSchema, invalidLink);
      expect(result.success).toBe(false);
      // Valibot's URL validation is nested, so we check for the 'href' key in the path
      expect(result.issues?.[0].path?.some(p => p.key === 'href')).toBe(true);
    });
  });

  describe('WebFingerSchema (JRD)', () => {
    const validLink1 = { rel: 'self', type: 'application/activity+json', href: 'https://example.com/actor' };
    const validLink2 = { rel: 'profile', type: 'text/html', href: 'https://example.com/profile/actor' };

    it('should validate a correct WebFinger JRD with subject, aliases, and links', () => {
      const validJRD = {
        subject: 'acct:user@example.com',
        aliases: ['https://example.com/users/user', 'https://another.example/user'],
        links: [validLink1, validLink2],
      };
      const result = v.safeParse(WebFingerSchema, validJRD);
      expect(result.success).toBe(true);
    });

    it('should validate a correct WebFinger JRD with only subject (minimal)', () => {
      const validJRD = { subject: 'acct:user@example.com' };
      const result = v.safeParse(WebFingerSchema, validJRD);
      expect(result.success).toBe(true);
    });

    it('should invalidate a WebFinger JRD missing subject', () => {
      const invalidJRD = {
        aliases: ['https://example.com/users/user'],
        links: [validLink1],
      };
      const result = v.safeParse(WebFingerSchema, invalidJRD);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('subject');
    });

    it('should invalidate a WebFinger JRD with links containing invalid link objects', () => {
      const invalidLink = { type: 'application/json' }; // Missing 'rel'
      const invalidJRD = {
        subject: 'acct:user@example.com',
        links: [validLink1, invalidLink],
      };
      const result = v.safeParse(WebFingerSchema, invalidJRD);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('links');
      expect(result.issues?.[0].path?.[2].key).toBe('rel'); // Path to the 'rel' inside the second link
    });

    it('should invalidate a WebFinger JRD with aliases containing non-URL strings', () => {
      const invalidJRD = {
        subject: 'acct:user@example.com',
        aliases: ['https://example.com/users/user', 'not-a-url'],
      };
      const result = v.safeParse(WebFingerSchema, invalidJRD);
      expect(result.success).toBe(false);
      expect(result.issues?.[0].path?.[0].key).toBe('aliases');
       // Check that the issue is related to the URL validation within the array
      expect(result.issues?.[0].validation).toBe('url');
    });
  });
});
