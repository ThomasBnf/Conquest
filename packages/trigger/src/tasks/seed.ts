import { client } from "@conquest/clickhouse/client";
import { UserWithWorkspaceSchema } from "@conquest/zod/schemas/user.schema";
import { faker } from "@faker-js/faker";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { getLocaleByAlpha2 } from "country-locale-map";
import ISO6391 from "iso-639-1";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getNumActivities } from "../seed/getNumActivities";
import { processDiscourse } from "../seed/processDiscourse";
import { processGithub } from "../seed/processGithub";
import { processLivestorm } from "../seed/processLivestorm";
import { getAllMembersMetrics } from "./getAllMembersMetrics";

export const seed = schemaTask({
  id: "seed",
  machine: "small-2x",
  schema: z.object({
    user: UserWithWorkspaceSchema,
  }),
  run: async ({ user }) => {
    if (user.role !== "STAFF") return;

    const { workspace_id } = user;

    const { channels, discourseActivityTypes } = await processDiscourse({
      user,
    });
    const { livestormActivityTypes, events } = await processLivestorm({ user });
    const { githubActivityTypes } = await processGithub({ user });

    const TOTAL_MEMBERS = 250;
    const inserts = [];
    const memberIds: string[] = [];

    for (let i = 0; i < TOTAL_MEMBERS; i++) {
      const member_id = randomUUID();
      memberIds.push(member_id);

      const first_name = faker.person.firstName();
      const last_name = faker.person.lastName();
      const primary_email = faker.internet.email({
        firstName: first_name,
        lastName: last_name,
        provider: faker.company
          .catchPhraseNoun()
          .toLowerCase()
          .replace(" ", "-")
          .concat(".com"),
      });

      let language = "";

      const country = faker.helpers.arrayElement([
        "FR",
        "US",
        "GB",
        "DE",
        "CA",
      ]);

      const locale = getLocaleByAlpha2(country.toUpperCase());
      const languageCode = locale?.split("_")[0] ?? "";
      language = languageCode ? ISO6391.getName(languageCode) : "";

      inserts.push(
        client.insert({
          table: "member",
          values: [
            {
              id: member_id,
              first_name,
              last_name,
              primary_email: primary_email.toLowerCase(),
              emails: [primary_email.toLowerCase()],
              phones: [faker.phone.number({ style: "international" })],
              job_title: faker.person.jobTitle(),
              avatar_url: faker.image.avatar(),
              country,
              language,
              source: "Discourse",
              created_at: faker.date.recent({ days: 180 }),
              workspace_id,
            },
          ],
          format: "JSON",
        }),
      );

      inserts.push(
        client.insert({
          table: "profile",
          values: [
            {
              external_id: randomUUID(),
              attributes: {
                source: "Discourse",
                username: faker.internet.username(),
                custom_fields: [
                  {
                    id: "1",
                    value: faker.internet.url(),
                  },
                  {
                    id: "2",
                    value: faker.datatype.boolean().toString(),
                  },
                  {
                    id: "3",
                    value: faker.datatype.boolean().toString(),
                  },
                ],
              },
              member_id,
              workspace_id,
            },
          ],
          format: "JSON",
        }),
      );
    }

    await Promise.all(inserts);

    logger.info("Finished inserting members");

    const activityInserts = [];
    const hasLivestormProfile = new Set<string>();

    for (const event of events) {
      const participatingMembers = faker.helpers.arrayElements(memberIds, {
        min: Math.floor(TOTAL_MEMBERS * 0.1),
        max: Math.floor(TOTAL_MEMBERS * 0.3),
      });

      for (const member_id of participatingMembers) {
        const roll = Math.random();

        let type:
          | "livestorm:register"
          | "livestorm:attend"
          | "livestorm:co-host";

        if (roll < 0.02) {
          type = "livestorm:co-host";
        } else if (roll < 0.5) {
          type = "livestorm:attend";
        } else {
          type = "livestorm:register";
        }

        const activity_type = livestormActivityTypes.find(
          (a) => a.key === type,
        );
        if (!activity_type) continue;

        activityInserts.push(
          client.insert({
            table: "activity",
            values: [
              {
                id: randomUUID(),
                activity_type_id: activity_type.id,
                member_id,
                event_id: event.id,
                workspace_id,
                source: "Livestorm",
                created_at: faker.date.between({
                  from: event.started_at,
                  to: event.ended_at ?? new Date(),
                }),
              },
            ],
            format: "JSON",
          }),
        );

        hasLivestormProfile.add(member_id);
      }
    }

    await Promise.all(activityInserts);

    logger.info("Finished inserting livestorm activities");

    const livestormProfileInserts = [];

    for (const member_id of hasLivestormProfile) {
      livestormProfileInserts.push(
        client.insert({
          table: "profile",
          values: [
            {
              external_id: randomUUID(),
              attributes: {
                source: "Livestorm",
              },
              member_id,
              workspace_id,
            },
          ],
          format: "JSON",
        }),
      );
    }

    await Promise.all(livestormProfileInserts);

    logger.info("Finished inserting livestorm profiles");

    const discourseActivityInserts = [];

    for (const member_id of memberIds) {
      const NUM_ACTIVITIES = getNumActivities();

      for (let i = 0; i < NUM_ACTIVITIES; i++) {
        const type = faker.helpers.arrayElement(discourseActivityTypes);

        discourseActivityInserts.push(
          client.insert({
            table: "activity",
            values: [
              {
                id: randomUUID(),
                activity_type_id: type.id,
                member_id,
                workspace_id,
                source: "Discourse",
                created_at: faker.date.recent({ days: 365 }),
              },
            ],
            format: "JSON",
          }),
        );
      }
    }

    await Promise.all(discourseActivityInserts);

    logger.info("Finished inserting discourse activities");

    const githubActivityInserts = [];
    const hasGithubProfile = new Set<string>();

    for (const member_id of memberIds) {
      const NUM_ACTIVITIES = getNumActivities();

      for (let i = 0; i < NUM_ACTIVITIES; i++) {
        const type = faker.helpers.arrayElement(githubActivityTypes);
        const channel = faker.helpers.arrayElement(channels);

        githubActivityInserts.push(
          client.insert({
            table: "activity",
            values: [
              {
                id: randomUUID(),
                activity_type_id: type.id,
                member_id,
                channel_id: channel.id,
                workspace_id,
                source: "Github",
                created_at: faker.date.recent({ days: 365 }),
              },
            ],
            format: "JSON",
          }),
        );

        hasGithubProfile.add(member_id);
      }
    }

    await Promise.all(githubActivityInserts);

    logger.info("Finished inserting github activities");

    const githubProfileInserts = [];

    for (const member_id of hasGithubProfile) {
      githubProfileInserts.push(
        client.insert({
          table: "profile",
          values: [
            {
              external_id: randomUUID(),
              attributes: {
                source: "Github",
                login: faker.internet.username(),
                bio: faker.lorem.paragraph(),
                blog: faker.internet.url(),
                location: faker.location.city(),
                followers: faker.number.int({ min: 0, max: 1000 }),
              },
              member_id,
              workspace_id,
            },
          ],
          format: "JSON",
        }),
      );
    }

    await Promise.all(githubProfileInserts);

    logger.info("Finished inserting github profiles");

    await getAllMembersMetrics.trigger({ workspace_id });
  },
});
