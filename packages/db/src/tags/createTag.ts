import type { Source } from "@conquest/zod/enum/source.enum";
import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { prisma } from "../prisma";

type Props = {
  externalId?: string;
  name: string;
  color: string;
  source: Source;
  workspaceId: string;
};

export const createTag = async (props: Props) => {
  const { externalId, name, color, source, workspaceId } = props;

  const tag = await prisma.tag.create({
    data: {
      externalId,
      name,
      color,
      source,
      workspaceId,
    },
  });

  return TagSchema.parse(tag);
};
