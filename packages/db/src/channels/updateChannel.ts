import type { Channel } from "@conquest/zod/schemas/channel.schema";
import { prisma } from "../prisma";

type Props =
  | { id: string }
  | ({ external_id: string; workspace_id: string } & Partial<Channel>);

export const updateChannel = async ({ id, ...data }: Props) => {
  await prisma.channel.update({
    where: { id },
    data,
  });
};
