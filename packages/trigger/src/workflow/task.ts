import { createTask } from "@conquest/db/task/createTask";
import { getUserById } from "@conquest/db/users/getUserById";
import { resend } from "@conquest/resend";
import TaskCreated from "@conquest/resend/emails/task-created";
import { MemberWithLevel } from "@conquest/zod/schemas/member.schema";
import { Node, NodeTaskSchema } from "@conquest/zod/schemas/node.schema";
import { Task } from "@conquest/zod/schemas/task.schema";
import { render } from "@react-email/components";
import { logger } from "@trigger.dev/sdk/v3";
import { addDays, endOfDay, format } from "date-fns";
import { v4 as uuid } from "uuid";
import { nodeStatus } from "./nodeStatus";

type Props = {
  node: Node;
  member: MemberWithLevel;
  slug: string;
};

export const task = async ({ node, member, slug }: Props): Promise<Node> => {
  const { workspaceId } = member;
  const { title, days, assignee, alertByEmail } = NodeTaskSchema.parse(
    node.data,
  );

  const newTask: Task = {
    id: uuid(),
    title,
    dueDate: endOfDay(addDays(new Date(), days)),
    assignee: assignee ?? null,
    isCompleted: false,
    memberId: member.id,
    workspaceId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await createTask(newTask);

    if (alertByEmail) {
      if (!assignee) {
        return nodeStatus({
          node,
          status: "FAILED",
          error: "Failed to send task email notification: Assignee not found",
        });
      }
      const user = await getUserById({ id: assignee });

      if (!user) {
        return nodeStatus({
          node,
          status: "FAILED",
          error: "Failed to send task email notification: User not found",
        });
      }

      const { id, title, dueDate } = newTask;
      const formattedDueDate = format(dueDate, "PP");

      try {
        await resend.emails.send({
          from: "Conquest <team@useconquest.com>",
          to: user.email,
          subject: `New Task: ${title}`,
          html: await render(
            TaskCreated({
              slug,
              taskId: id,
              taskTitle: title,
              taskDueDate: formattedDueDate,
            }),
          ),
        });
      } catch (error) {
        logger.info("Resend", { error });
        return nodeStatus({
          node,
          status: "FAILED",
          error: "Failed to send task email notification",
        });
      }
    }

    return nodeStatus({ node, status: "COMPLETED" });
  } catch (error) {
    return nodeStatus({
      node,
      status: "FAILED",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
