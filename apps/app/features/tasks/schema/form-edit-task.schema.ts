import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";

export const FormEditTaskSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  dueDate: z.date().optional(),
  assignee: z.string().nullable(),
  member: MemberSchema.nullable(),
  isCompleted: z.boolean(),
});

export type FormEditTask = z.infer<typeof FormEditTaskSchema>;
