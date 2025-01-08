import type { Source } from "@conquest/zod/enum/source.enum";
import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { prisma } from "lib/prisma";

type Props = {
  external_id: string | null;
  name: string;
  color: string;
  source: Source;
  workspace_id: string;
};

export const createTag = async ({
  external_id,
  name,
  color,
  source,
  workspace_id,
}: Props) => {
  const tag = await prisma.tags.create({
    data: {
      external_id,
      name,
      color,
      source,
      workspace_id,
    },
  });

  return TagSchema.parse(tag);
};
