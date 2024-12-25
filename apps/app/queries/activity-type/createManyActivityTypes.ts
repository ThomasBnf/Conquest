import { prisma } from "@/lib/prisma";
import type { SOURCE } from "@conquest/database/src";

export const createManyActivityTypes = async ({
  activity_types,
  workspace_id,
}: {
  activity_types: {
    name: string;
    source: string;
    key: string;
    weight: number;
    deletable: boolean;
  }[];
  workspace_id: string;
}) => {
  await prisma.activities_types.createMany({
    data: activity_types.map((activity_type) => {
      const { name, source, key, weight, deletable } = activity_type;
      return {
        name,
        source: source as SOURCE,
        key,
        weight,
        deletable,
        workspace_id,
      };
    }),
  });
};
