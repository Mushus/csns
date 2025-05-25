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
