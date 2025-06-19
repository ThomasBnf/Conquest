import { prisma } from "@conquest/db/prisma";

import { getTag } from "@conquest/db/tags/getTag";
import { COLORS } from "@conquest/utils/colors";
import { Tag, TagSchema } from "@conquest/zod/schemas/tag.schema";
import { randomUUID } from "node:crypto";

type Props = {
  members: Record<string, string>[];
  workspaceId: string;
};

export const processTags = async ({
  members,
  workspaceId,
}: Props): Promise<Tag[]> => {
  const tags = [...new Set(members.map((member) => member.tags))];

  const createdTags: Tag[] = [];

  for (const tag of tags) {
    if (!tag) continue;

    const existingTag = await getTag({ name: tag, workspaceId });

    if (existingTag) {
      createdTags.push(existingTag);
      continue;
    }

    const createdTag: Tag = {
      id: randomUUID(),
      externalId: null,
      name: tag,
      color:
        COLORS[Math.floor(Math.random() * COLORS.length)]?.hex ?? "#0070f3",
      source: "Manual",
      workspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await prisma.tag.create({ data: createdTag });

    createdTags.push(createdTag);
  }

  return TagSchema.array().parse(createdTags);
};
