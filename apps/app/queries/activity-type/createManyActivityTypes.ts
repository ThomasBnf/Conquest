import { prisma } from "@/lib/prisma";
import type { Source } from "@conquest/zod/enum/source.enum";
import type { Channel } from "@conquest/zod/schemas/channel.schema";

type Props = {
  activity_types: {
    name: string;
    source: string;
    key: string;
    weight: number;
    deletable: boolean;
  }[];
  channels: Channel[];
  workspace_id: string;
};

export const createManyActivityTypes = async ({
  activity_types,
  channels,
  workspace_id,
}: Props) => {
  await prisma.activities_types.createMany({
    data: activity_types.map((activity_type) => {
      const { name, source, key, weight, deletable } = activity_type;
      return {
        name,
        source: source as Source,
        key,
        weight,
        channels: channels.map((channel) => channel.id),
        deletable,
        workspace_id,
      };
    }),
  });
};
