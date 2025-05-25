import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { APObjectSchema, APActorSchema } from '../../src/activitypub/types';

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
});
