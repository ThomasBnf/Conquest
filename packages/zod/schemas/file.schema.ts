import z from "zod";

export const FileSchema = z.object({
  id: z.string().cuid(),
  title: z.string().nullable(),
  url: z.string(),
  activity_id: z.string().cuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type File = z.infer<typeof FileSchema>;
