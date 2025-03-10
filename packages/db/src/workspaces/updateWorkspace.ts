import type { Workspace } from "@conquest/zod/schemas/workspace.schema";
import { prisma } from "../prisma";

type Props = {
  id: string;
} & Partial<Workspace>;

export const updateWorkspace = async ({ id, ...data }: Props) => {
  await prisma.workspace.update({
    where: {
      id,
    },
    data,
  });
};
