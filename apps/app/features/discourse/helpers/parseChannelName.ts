import type { Category } from "@conquest/zod/types/discourse";

export const parseChannelName = (
  channel: Category,
  discourseChannels: Category[],
) => {
  if (!channel.parent_category_id) return channel.name ?? "";

  const parent = discourseChannels.find(
    (parent) => parent.id === channel.parent_category_id,
  );
  if (!parent) return channel.name ?? "";

  if (!parent.parent_category_id) {
    return `${parent.name} - ${channel.name}`;
  }

  const grandParent = discourseChannels.find(
    (grandParent) => grandParent.id === parent.parent_category_id,
  );
  if (!grandParent) return `${parent.name} - ${channel.name}`;

  return `${grandParent.name} - ${parent.name} - ${channel.name}`;
};
