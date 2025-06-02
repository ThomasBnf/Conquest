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

  const createdTags: Tag[] = [];

  for (const tag of tags) {
    if (!tag) continue;

    const existingTag = await prisma.tag.findFirst({
      where: {
        name: tag,
        workspaceId,
      },
    });

    if (existingTag) {
      createdTags.push(TagSchema.parse(existingTag));
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

const COLORS = [
  { name: "Gray", hex: "#6E7B8B" },
  { name: "Blue", hex: "#0070f3" },
  { name: "Cyan", hex: "#00A8C1" },
  { name: "Green", hex: "#3FAB77" },
  { name: "Yellow", hex: "#F2B200" },
  { name: "Orange", hex: "#D88234" },
  { name: "Pink", hex: "#EB5756" },
  { name: "Red", hex: "#F38E82" },
];
