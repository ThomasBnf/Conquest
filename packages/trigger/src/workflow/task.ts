import { createTask } from "@conquest/db/task/createTask";
import { MemberWithLevel } from "@conquest/zod/schemas/member.schema";
import { NodeTask } from "@conquest/zod/schemas/node.schema";
import { Task } from "@conquest/zod/schemas/task.schema";
import { addDays, endOfDay } from "date-fns";
import { v4 as uuid } from "uuid";

type Props = {
  node: NodeTask;
  member: MemberWithLevel;
};

export const task = async ({ node, member }: Props) => {
  const { workspaceId } = member;
  const { title, days, assignee } = node;

  const task: Task = {
    id: uuid(),
    title,
    dueDate: endOfDay(addDays(new Date(), days)),
    assignee,
    isCompleted: false,
    memberId: member.id,
    workspaceId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await createTask(task);
};
