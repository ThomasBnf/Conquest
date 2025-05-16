import { createManyActivityTypes } from "@conquest/clickhouse/activity-type/createManyActivityTypes";
import { listActivityTypes } from "@conquest/clickhouse/activity-type/listActivityTypes";
import { LIVESTORM_ACTIVITY_TYPES } from "@conquest/db/constant";
import { prisma } from "@conquest/db/prisma";
import { Event } from "@conquest/zod/schemas/event.schema";
import { UserWithWorkspace } from "@conquest/zod/schemas/user.schema";
import { faker } from "@faker-js/faker";
import { randomUUID } from "node:crypto";

export const processLivestorm = async ({
  user,
}: { user: UserWithWorkspace }) => {
  const { workspaceId } = user;

  const livestorm = await prisma.integration.create({
    data: {
      externalId: null,
      connectedAt: new Date(),
      status: "CONNECTED",
      details: {
        source: "Livestorm",
        name: "Conquest",
        accessToken: faker.string.uuid(),
        accessTokenIv: faker.string.uuid(),
        refreshToken: faker.string.uuid(),
        refreshTokenIv: faker.string.uuid(),
        expiresIn: faker.number.int({ min: 3600, max: 86400 }),
        scope: "read:user",
        filter: "",
      },
      createdBy: user.id,
      workspaceId,
      triggerToken: "1234567890",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await createManyActivityTypes({
    activityTypes: LIVESTORM_ACTIVITY_TYPES,
    workspaceId,
  });

  const activityTypes = await listActivityTypes({ workspaceId });
  const filteredActivityTypes = activityTypes.filter(
    (activityType) => activityType.source === "Livestorm",
  );

  const events: Event[] = [];

  for (let i = 0; i < 10; i++) {
    const start = faker.date.soon({ days: 30 });
    const durationMinutes = faker.number.int({ min: 30, max: 120 });
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    const event = await prisma.event.create({
      data: {
        externalId: randomUUID(),
        title: faker.company.catchPhrase(),
        startedAt: start,
        endedAt: end,
        source: "Livestorm",
        workspaceId,
      },
    });

    events.push(event);
  }

  return {
    livestorm,
    livestormActivityTypes: filteredActivityTypes,
    events,
  };
};
