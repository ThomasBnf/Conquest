import { client } from "@conquest/clickhouse/client";
import { listWorkspaces } from "@conquest/db/workspaces/listWorkspaces";
import {
  DiscourseProfileSchema,
  GithubProfileSchema,
  Profile,
  ProfileSchema,
  TwitterProfileSchema,
} from "@conquest/zod/schemas/profile.schema";
import { logger } from "@trigger.dev/sdk/v3";

export const updateProfiles = async () => {
  const workspaces = await listWorkspaces();

  for (const workspace of workspaces) {
    logger.info(workspace.name);

    const updatedProfiles: Profile[] = [];

    const result = await client.query({
      query: `
        SELECT *
        FROM profile
        WHERE workspaceId = '${workspace.id}'
      `,
    });

    const { data } = await result.json();
    const profiles = ProfileSchema.array().parse(data);

    const githubProfiles = GithubProfileSchema.array().parse(
      profiles.filter((profile) => profile.attributes.source === "Github"),
    );

    const discourseProfiles = DiscourseProfileSchema.array().parse(
      profiles.filter((profile) => profile.attributes.source === "Discourse"),
    );

    const twitterProfiles = TwitterProfileSchema.array().parse(
      profiles.filter((profile) => profile.attributes.source === "Twitter"),
    );

    if (githubProfiles.length > 0) {
      const profiles = githubProfiles.map((profile) => ({
        ...profile,
        externalId: profile.attributes.login!,
        attributes: {
          source: "Github" as const,
          bio: profile.attributes.bio,
          blog: profile.attributes.blog,
          followers: profile.attributes.followers,
          location: profile.attributes.location,
        },
        updatedAt: new Date(),
      }));

      logger.info("profiles", { count: profiles.length });
      updatedProfiles.push(...profiles);
      logger.info("Updated Github profiles");
    }

    if (discourseProfiles.length > 0) {
      const profiles = discourseProfiles.map((profile) => ({
        ...profile,
        externalId: profile.attributes.username!,
        attributes: {
          source: "Discourse" as const,
        },
        updatedAt: new Date(),
      }));

      logger.info("profiles", { count: profiles.length });
      updatedProfiles.push(...profiles);
      logger.info("Updated Discourse profiles");
    }

    if (twitterProfiles.length > 0) {
      const profiles = twitterProfiles.map((profile) => ({
        ...profile,
        externalId: profile.attributes.username!,
        attributes: {
          source: "Twitter" as const,
        },
        updatedAt: new Date(),
      }));

      logger.info("profiles", { count: profiles.length });
      updatedProfiles.push(...profiles);
      logger.info("Updated Twitter profiles");
    }

    if (updatedProfiles.length > 0) {
      logger.info("inserting profiles", { count: updatedProfiles.length });
      await client.insert({
        table: "profile",
        values: updatedProfiles,
        format: "JSON",
      });
    }
  }

  await client.query({
    query: `
      OPTIMIZE TABLE profile FINAL;
    `,
  });
};
