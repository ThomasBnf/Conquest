import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";

export const FormCreateTaskSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  dueDate: z.date(),
  assignee: z.string(),
  member: MemberSchema.optional(),
});

export type FormCreateTask = z.infer<typeof FormCreateTaskSchema>;
