import { createTag } from "@conquest/db/tags/createTag";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import type DiscourseAPI from "discourse2";

export const createManyTags = async ({
  client,
  workspace_id,
}: {
  client: DiscourseAPI;
  workspace_id: string;
}) => {
  const tags: Tag[] = [];

  const { badges } = await client.adminListBadges();

  for (const badge of badges ?? []) {
    const { id, name, badge_type_id } = badge;

    const colorMap = {
      "1": "#E7C200",
      "2": "#CD7F31",
      "3": "#C0C0C0",
    } as const;

    const color = colorMap[String(badge_type_id) as keyof typeof colorMap];

    const createdTag = await createTag({
      external_id: String(id),
      name,
      color,
      source: "Discourse",
      workspace_id,
    });

    tags.push(createdTag);
  }

  return tags;
};
