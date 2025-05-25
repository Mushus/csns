import * as v from 'valibot';

export const APObjectSchema = v.object({
  id: v.string([v.url()]),
  type: v.string(),
  name: v.optional(v.string()),
  content: v.optional(v.string()),
  attributedTo: v.optional(v.string([v.url()])),
  published: v.optional(v.string([v.isoDateTime()])),
  to: v.optional(v.array(v.string([v.url()]))),
  cc: v.optional(v.array(v.string([v.url()]))),
});
export type APObject = v.Input<typeof APObjectSchema>;

export const APActorSchema = v.intersect([
  APObjectSchema,
  v.object({
    type: v.string(), // Consider v.union([v.literal('Person'), v.literal('Service'), ...]) later
    inbox: v.string([v.url()]),
    outbox: v.string([v.url()]),
    preferredUsername: v.optional(v.string()),
  }),
]);
export type APActor = v.Input<typeof APActorSchema>;

// Activity Schemas
export const ActivitySchema = v.intersect([
  APObjectSchema,
  v.object({
    actor: v.union([APActorSchema, v.string([v.url()])]),
    object: v.union([APObjectSchema, v.string([v.url()])]),
  }),
]);
export type Activity = v.Input<typeof ActivitySchema>;

export const CreateActivitySchema = v.intersect([
  ActivitySchema,
  v.object({
    type: v.literal('Create'),
  }),
]);
export type CreateActivity = v.Input<typeof CreateActivitySchema>;

export const FollowActivitySchema = v.intersect([
  ActivitySchema,
  v.object({
    type: v.literal('Follow'),
    object: v.union([APActorSchema, v.string([v.url()])]), // Override object type
  }),
]);
export type FollowActivity = v.Input<typeof FollowActivitySchema>;

export const LikeActivitySchema = v.intersect([
  ActivitySchema,
  v.object({
    type: v.literal('Like'),
  }),
]);
export type LikeActivity = v.Input<typeof LikeActivitySchema>;

export const AnnounceActivitySchema = v.intersect([
  ActivitySchema,
  v.object({
    type: v.literal('Announce'),
  }),
]);
export type AnnounceActivity = v.Input<typeof AnnounceActivitySchema>;

// WebFinger Schemas
export const WebFingerLinkSchema = v.object({
  rel: v.string(),
  type: v.optional(v.string()),
  href: v.optional(v.string([v.url()])),
});
export type WebFingerLink = v.Input<typeof WebFingerLinkSchema>;

export const WebFingerSchema = v.object({
  subject: v.string(),
  aliases: v.optional(v.array(v.string([v.url()]))),
  links: v.optional(v.array(WebFingerLinkSchema)),
});
export type WebFinger = v.Input<typeof WebFingerSchema>;
