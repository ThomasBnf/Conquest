import { prisma } from "lib/prisma";

type Props = {
  name: string;
  source: "API" | "MANUAL" | "SLACK";
  external_id: string | null;
  workspace_id: string;
};

export const createChannel = async ({
  name,
  source,
  external_id,
  workspace_id,
}: Props) => {
  return await prisma.channel.create({
    data: {
      name,
      source,
      external_id,
      workspace_id,
    },
  });
};
