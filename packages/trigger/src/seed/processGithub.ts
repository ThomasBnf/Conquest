import { createManyActivityTypes } from "@conquest/clickhouse/activity-types/createManyActivityTypes";
import { listActivityTypes } from "@conquest/clickhouse/activity-types/listActivityTypes";
import { GITHUB_ACTIVITY_TYPES } from "@conquest/db/constant";
import { prisma } from "@conquest/db/prisma";
import { UserWithWorkspace } from "@conquest/zod/schemas/user.schema";
import { faker } from "@faker-js/faker";

export const processGithub = async ({ user }: { user: UserWithWorkspace }) => {
  const { workspace_id } = user;

  const github = await prisma.integration.create({
    data: {
      external_id: null,
      connected_at: new Date(),
      status: "CONNECTED",
      details: {
        source: "Github",
        access_token: faker.string.uuid(),
        iv: faker.string.uuid(),
        installation_id: faker.number.int({ min: 1, max: 1000 }),
        scope: "read:user",
        repo: "conquest",
        owner: "thomasbnfls",
      },
      created_by: user.id,
      workspace_id,
      trigger_token: "1234567890",
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await createManyActivityTypes({
    activity_types: GITHUB_ACTIVITY_TYPES,
    workspace_id,
  });

  const activity_types = await listActivityTypes({ workspace_id });
  const filteredActivityTypes = activity_types.filter(
    (activity_type) => activity_type.source === "Github",
  );

  return {
    github,
    githubActivityTypes: filteredActivityTypes,
  };
};
