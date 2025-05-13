import { z } from "zod";

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  dueDate: z.date().optional(),
  assignee: z.string(),
  memberId: z.string().optional(),
  workspaceId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Task = z.infer<typeof TaskSchema>;
