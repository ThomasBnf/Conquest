import { createManyActivityTypes } from "@conquest/clickhouse/activity-type/createManyActivityTypes";
import { listActivityTypes } from "@conquest/clickhouse/activity-type/listActivityTypes";
import { GITHUB_ACTIVITY_TYPES } from "@conquest/db/constant";
import { prisma } from "@conquest/db/prisma";
import { UserWithWorkspace } from "@conquest/zod/schemas/user.schema";
import { faker } from "@faker-js/faker";

export const processGithub = async ({ user }: { user: UserWithWorkspace }) => {
  const { workspaceId } = user;

  const github = await prisma.integration.create({
    data: {
      externalId: null,
      connectedAt: new Date(),
      status: "CONNECTED",
      details: {
        source: "Github",
        repo: "conquest",
        owner: "thomasbnfls",
        installationId: faker.number.int({ min: 1, max: 1000 }),
        token: faker.string.uuid(),
        tokenIv: faker.string.uuid(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        permissions: {
          issues: "read",
          pull_requests: "read",
          contents: "read",
        },
      },
      createdBy: user.id,
      workspaceId,
      triggerToken: "1234567890",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await createManyActivityTypes({
    activityTypes: GITHUB_ACTIVITY_TYPES,
    workspaceId,
  });

  const activityTypes = await listActivityTypes({ workspaceId });
  const filteredActivityTypes = activityTypes.filter(
    (activityType) => activityType.source === "Github",
  );

  return {
    github,
    githubActivityTypes: filteredActivityTypes,
  };
};
