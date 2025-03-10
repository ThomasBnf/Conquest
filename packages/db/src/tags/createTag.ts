import type { Source } from "@conquest/zod/enum/source.enum";
import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { prisma } from "../prisma";

type Props = {
  external_id?: string;
  name: string;
  color: string;
  source: Source;
  workspace_id: string;
};

export const createTag = async (props: Props) => {
  const { external_id, name, color, source, workspace_id } = props;

  const tag = await prisma.tag.create({
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
