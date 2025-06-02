import { client } from "@conquest/clickhouse/client";
import { listWorkspaces } from "@conquest/db/workspaces/listWorkspaces";
import {
  DiscourseProfileSchema,
  GithubProfileSchema,
  ProfileSchema,
  TwitterProfileSchema,
} from "@conquest/zod/schemas/profile.schema";
import { logger } from "@trigger.dev/sdk/v3";

export const updateProfiles = async () => {
  const workspaces = await listWorkspaces();

  for (const workspace of workspaces) {
    logger.info(workspace.name);

    const updatedProfiles = [];

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
      updatedProfiles.push(
        ...githubProfiles.map((profile) => ({
          ...profile,
          externalId: profile.attributes.login,
          attributes: {
            source: "Github",
            bio: profile.attributes.bio,
            blog: profile.attributes.blog,
            followers: profile.attributes.followers,
            location: profile.attributes.location,
          },
          updatedAt: new Date(),
        })),
      );

      logger.info("Updated Github profiles");
    }

    if (discourseProfiles.length > 0) {
      updatedProfiles.push(
        ...discourseProfiles.map((profile) => ({
          ...profile,
          externalId: profile.attributes.username,
          attributes: {
            source: "Discourse",
          },
          updatedAt: new Date(),
        })),
      );

      logger.info("Updated Discourse profiles");
    }

    if (twitterProfiles.length > 0) {
      updatedProfiles.push(
        ...twitterProfiles.map((profile) => ({
          ...profile,
          externalId: profile.attributes.username,
          attributes: {
            source: "Twitter",
          },
          updatedAt: new Date(),
        })),
      );

      logger.info("Updated Twitter profiles");
    }

    if (updateProfiles.length > 0) {
      await client.insert({
        table: "profile",
        values: updatedProfiles,
        format: "JSON",
      });
    }
  }
};
