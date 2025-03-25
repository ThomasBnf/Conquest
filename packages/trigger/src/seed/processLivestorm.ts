import { createManyActivityTypes } from "@conquest/clickhouse/activity-types/createManyActivityTypes";
import { listActivityTypes } from "@conquest/clickhouse/activity-types/listActivityTypes";
import { LIVESTORM_ACTIVITY_TYPES } from "@conquest/db/constant";
import { prisma } from "@conquest/db/prisma";
import { Event } from "@conquest/zod/schemas/event.schema";
import { UserWithWorkspace } from "@conquest/zod/schemas/user.schema";
import { faker } from "@faker-js/faker";
import { randomUUID } from "node:crypto";

export const processLivestorm = async ({
  user,
}: { user: UserWithWorkspace }) => {
  const { workspace_id } = user;

  const livestorm = await prisma.integration.create({
    data: {
      external_id: null,
      connected_at: new Date(),
      status: "CONNECTED",
      details: {
        source: "Livestorm",
        name: "Conquest",
        access_token: faker.string.uuid(),
        access_token_iv: faker.string.uuid(),
        refresh_token: faker.string.uuid(),
        refresh_token_iv: faker.string.uuid(),
        expires_in: faker.number.int({ min: 3600, max: 86400 }),
        scope: "read:user",
      },
      created_by: user.id,
      workspace_id,
      trigger_token: "1234567890",
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await createManyActivityTypes({
    activity_types: LIVESTORM_ACTIVITY_TYPES,
    workspace_id,
  });

  const activity_types = await listActivityTypes({ workspace_id });
  const filteredActivityTypes = activity_types.filter(
    (activity_type) => activity_type.source === "Livestorm",
  );

  const events: Event[] = [];

  for (let i = 0; i < 10; i++) {
    const start = faker.date.soon({ days: 30 });
    const durationMinutes = faker.number.int({ min: 30, max: 120 });
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    const event = await prisma.event.create({
      data: {
        external_id: randomUUID(),
        title: faker.company.catchPhrase(),
        started_at: start,
        ended_at: end,
        source: "Livestorm",
        workspace_id,
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
