import { Task } from "@conquest/zod/schemas/task.schema";
import { prisma } from "../prisma";

type Props = Task;

export const createTask = async (props: Props) => {
  await prisma.task.create({
    data: props,
  });
};
