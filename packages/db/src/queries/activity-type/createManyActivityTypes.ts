import type { Source } from "@conquest/zod/enum/source.enum";
import { prisma } from "../../prisma";

type Props = {
  activity_types: {
    name: string;
    source: string;
    key: string;
    weight: number;
    deletable: boolean;
  }[];
  workspace_id: string;
};

export const createManyActivityTypes = async ({
  activity_types,
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
        channels: [],
        deletable,
        workspace_id,
      };
    }),
  });
};
