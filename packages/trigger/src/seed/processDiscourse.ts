import { createManyActivityTypes } from "@conquest/db/activity-type/createManyActivityTypes";
import { listActivityTypes } from "@conquest/db/activity-type/listActivityTypes";
import { createChannel } from "@conquest/db/channel/createChannel";
import { DISCOURSE_ACTIVITY_TYPES } from "@conquest/db/constant";
import { prisma } from "@conquest/db/prisma";
import { Channel, ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { User, UserSchema } from "@conquest/zod/schemas/user.schema";
import { randomUUID } from "node:crypto";

export const DISCOURSE_CHANNELS = [
  {
    externalId: randomUUID(),
    name: "General",
    slug: "/general",
    source: "Discourse" as const,
  },
  {
    externalId: randomUUID(),
    name: "Product feedback",
    slug: "/product-feedback",
    source: "Discourse" as const,
  },
  {
    externalId: randomUUID(),
    name: "Help & Questions",
    slug: "/help-questions",
    source: "Discourse" as const,
  },
  {
    externalId: randomUUID(),
    name: "Tools",
    slug: "/tools",
    source: "Discourse" as const,
  },
  {
    externalId: randomUUID(),
    name: "Events",
    slug: "/events",
    source: "Discourse" as const,
  },
];

export const processDiscourse = async ({ user }: { user: User }) => {
  const { workspaceId } = user;

  const discourse = await prisma.integration.create({
    data: {
      externalId: null,
      connectedAt: new Date(),
      status: "CONNECTED",
      details: {
        source: "Discourse",
        communityUrl: "https://community.conquest.com",
        apiKey: "1234567890",
        apiKeyIv: "1234567890",
        userFields: [
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
      createdBy: user.id,
      workspaceId,
      triggerToken: "1234567890",
      expiresAt: new Date(),
    },
  });

  await createManyActivityTypes({
    activityTypes: DISCOURSE_ACTIVITY_TYPES,
    workspaceId,
  });

  const activityTypes = await listActivityTypes({ workspaceId });
  const filteredActivityTypes = activityTypes.filter(
    (activityType) => activityType.source === "Discourse",
  );

  const channels: Channel[] = [];

  for (const channel of DISCOURSE_CHANNELS) {
    const createdChannel = ChannelSchema.parse(
      await createChannel({
        ...channel,
        externalId: channel.externalId,
        workspaceId,
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
