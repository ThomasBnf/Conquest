import { createTag } from "@/queries/tags/createTag";
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

    const createdTag = await createTag({
      external_id: String(id),
      name,
      color: String(badge_type_id),
      source: "DISCOURSE",
      workspace_id,
    });

    tags.push(createdTag);
  }

  return tags;
};
