import { Tag, TagSchema } from "@conquest/zod/schemas/tag.schema";
import { prisma } from "../prisma";

type Props = Tag;

export const createTag = async (props: Props) => {
  const tag = await prisma.tag.create({
    data: {
      ...props,
    },
  });

  return TagSchema.parse(tag);
};
