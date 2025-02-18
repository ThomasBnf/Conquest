import type { Category } from "@conquest/zod/types/discourse";

export const groupChannels = (channels: Category[]) => {
  if (!channels) return [];

  const rootChannels = channels.filter(
    (channel) => !channel.parent_category_id && !channel.read_restricted,
  );

  return rootChannels.map((channel) => {
    const children = channels
      .filter((child) => child.parent_category_id === channel.id)
      .map((child) => ({
        ...child,
        children: channels.filter(
          (grandchild) => grandchild.parent_category_id === child.id,
        ),
      }));

    return {
      ...channel,
      children,
    };
  });
};
