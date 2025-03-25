import { createManyActivityTypes } from "@conquest/clickhouse/activity-types/createManyActivityTypes";
import { listActivityTypes } from "@conquest/clickhouse/activity-types/listActivityTypes";
import { createChannel } from "@conquest/clickhouse/channels/createChannel";
import { DISCOURSE_ACTIVITY_TYPES } from "@conquest/db/constant";
import { prisma } from "@conquest/db/prisma";
import { Channel, ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { UserWithWorkspace } from "@conquest/zod/schemas/user.schema";
import { randomUUID } from "node:crypto";

export const DISCOURSE_CHANNELS = [
  {
    external_id: randomUUID(),
    name: "General",
    slug: "/general",
    source: "Discourse" as const,
  },
  {
    external_id: randomUUID(),
    name: "Help & Questions",
    slug: "/help-questions",
    source: "Discourse" as const,
  },
  {
    external_id: randomUUID(),
    name: "Tools",
    slug: "/tools",
    source: "Discourse" as const,
  },
  {
    external_id: randomUUID(),
    name: "Events",
    slug: "/events",
    source: "Discourse" as const,
  },
];

export const processDiscourse = async ({
  user,
}: { user: UserWithWorkspace }) => {
  const { workspace_id } = user;

  const discourse = await prisma.integration.create({
    data: {
      external_id: null,
      connected_at: new Date(),
      status: "CONNECTED",
      details: {
        source: "Discourse",
        community_url: "https://community.conquest.com",
        api_key: "1234567890",
        api_key_iv: "1234567890",
        user_fields: [
          {
            id: "1",
            name: "Website",
          },
          {
            id: "2",
            name: "Sell services",
          },
          {
            id: "3",
            name: "Creator",
          },
        ],
      },
      created_by: user.id,
      workspace_id,
      trigger_token: "1234567890",
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await createManyActivityTypes({
    activity_types: DISCOURSE_ACTIVITY_TYPES,
    workspace_id,
  });

  const activity_types = await listActivityTypes({ workspace_id });
  const filteredActivityTypes = activity_types.filter(
    (activity_type) => activity_type.source === "Discourse",
  );

  const channels: Channel[] = [];

  for (const channel of DISCOURSE_CHANNELS) {
    const createdChannel = ChannelSchema.parse(
      await createChannel({
        ...channel,
        workspace_id,
      }),
    );

    channels.push(createdChannel);
  }

  return {
    discourse,
    discourseActivityTypes: filteredActivityTypes,
    channels,
  };
};
