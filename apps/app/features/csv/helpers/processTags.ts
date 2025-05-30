import { COLORS } from "@/constant";
import { Tag, prisma } from "@conquest/db/prisma";
import { TagSchema } from "@conquest/zod/schemas/tag.schema";
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

  const createdTags: Tag[] = tags.filter(Boolean).map((name) => ({
    id: randomUUID(),
    externalId: null,
    name: name ?? "",
    color: COLORS[Math.floor(Math.random() * COLORS.length)]?.hex ?? "#0070f3",
    source: "Manual",
    workspaceId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await prisma.tag.createMany({
    data: createdTags,
    skipDuplicates: true,
  });

  return TagSchema.array().parse(createdTags);
};
