import { z } from "zod";

export const V1CreateActivitySchema = z.object({
  activity_key: z.string(),
  message: z.string(),
  external_id: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  thread_id: z.string().nullable().optional(),
  reply_to: z.string().nullable().optional(),
  react_to: z.string().nullable().optional(),
  invite_to: z.string().nullable().optional(),
  channel_id: z.string().cuid().nullable().optional(),
  event_id: z.string().cuid().nullable().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const V1UpdateActivitySchema = z.object({
  activity_key: z.string().optional(),
  external_id: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  message: z.string().optional(),
  thread_id: z.string().nullable().optional(),
  reply_to: z.string().nullable().optional(),
  react_to: z.string().nullable().optional(),
  invite_to: z.string().nullable().optional(),
  channel_id: z.string().cuid().nullable().optional(),
  event_id: z.string().cuid().nullable().optional(),
});
