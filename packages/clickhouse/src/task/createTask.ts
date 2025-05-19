import { Task } from "@conquest/zod/schemas/task.schema";
import { client } from "../client";

type Props = Task;

export const createTask = async (props: Props) => {
  await client.insert({
    table: "task",
    values: [props],
    format: "JSON",
  });
};
