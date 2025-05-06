import { createManyActivityTypes } from "@conquest/clickhouse/activity-types/createManyActivityTypes";
import { listActivityTypes } from "@conquest/clickhouse/activity-types/listActivityTypes";
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
        accessToken: faker.string.uuid(),
        accessTokenIv: faker.string.uuid(),
        refreshToken: faker.string.uuid(),
        refreshTokenIv: faker.string.uuid(),
        refreshTokenExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        expiresIn: faker.number.int({ min: 3600, max: 86400 }),
        installationId: faker.number.int({ min: 1, max: 1000 }),
        repo: "conquest",
        owner: "thomasbnfls",
        scope: "read:user",
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
