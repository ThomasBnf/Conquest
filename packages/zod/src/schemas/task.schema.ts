import { z } from "zod";

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  dueDate: z.coerce.date(),
  assignee: z.string().nullable(),
  isCompleted: z.boolean(),
  memberId: z.string().nullable(),
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Task = z.infer<typeof TaskSchema>;
