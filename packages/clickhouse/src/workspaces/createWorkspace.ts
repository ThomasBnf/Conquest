import type { Workspace } from "@conquest/zod/schemas/workspace.schema";
import { v4 as uuid } from "uuid";
import { client } from "../client";
import { getWorkspace } from "./getWorkspace";

type Props = Partial<Workspace>;

export const createWorkspace = async (props: Props) => {
  const id = uuid();

  await client.insert({
    table: "workspaces",
    values: {
      id,
      plan: "BASIC",
      ...props,
    },
    format: "JSON",
  });

  return await getWorkspace({ id });
};
