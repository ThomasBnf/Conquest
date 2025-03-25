import {
  DISCOURSE_ACTIVITY_TYPES,
  GITHUB_ACTIVITY_TYPES,
  LIVESTORM_ACTIVITY_TYPES,
} from "@/constant";
import { createManyActivityTypes } from "@conquest/clickhouse/activity-types/createManyActivityTypes";
import { listActivityTypes } from "@conquest/clickhouse/activity-types/listActivityTypes";
import { createChannel } from "@conquest/clickhouse/channels/createChannel";
import { client } from "@conquest/clickhouse/client";
import { prisma } from "@conquest/db/prisma";
import { getAllMembersMetrics } from "@conquest/trigger/tasks/getAllMembersMetrics";
import { Event } from "@conquest/zod/schemas/event.schema";
import { UserWithWorkspace } from "@conquest/zod/schemas/user.schema";
import { faker } from "@faker-js/faker";
import { getLocaleByAlpha2 } from "country-locale-map";
import ISO6391 from "iso-639-1";
import { randomUUID } from "node:crypto";
import { protectedProcedure } from "../trpc";

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

export const seed = protectedProcedure.mutation(async ({ ctx: { user } }) => {
  if (user.role !== "STAFF") return;

  const { workspace_id } = user;

  const { discourseActivityTypes } = await processDiscourse({ user });
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
    const country = faker.location.countryCode();
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

  const activityInserts = [];
  const hasLivestormProfile = new Set<string>();

  for (const event of events) {
    const participatingMembers = faker.helpers.arrayElements(memberIds, {
      min: Math.floor(TOTAL_MEMBERS * 0.1),
      max: Math.floor(TOTAL_MEMBERS * 0.3),
    });

    for (const member_id of participatingMembers) {
      const roll = Math.random();

      let type: "livestorm:register" | "livestorm:attend" | "livestorm:co-host";

      if (roll < 0.02) {
        type = "livestorm:co-host";
      } else if (roll < 0.5) {
        type = "livestorm:attend";
      } else {
        type = "livestorm:register";
      }

      const activity_type = livestormActivityTypes.find((a) => a.key === type);
      if (!activity_type) continue;

      activityInserts.push(
        client.insert({
          table: "activity",
          values: [
            {
              id: randomUUID(),
              activity_type_id: activity_type.id,
              member_id,
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

  const githubActivityInserts = [];
  const hasGithubProfile = new Set<string>();

  for (const member_id of memberIds) {
    const NUM_ACTIVITIES = getNumActivities();

    for (let i = 0; i < NUM_ACTIVITIES; i++) {
      const type = faker.helpers.arrayElement(githubActivityTypes);

      githubActivityInserts.push(
        client.insert({
          table: "activity",
          values: [
            {
              id: randomUUID(),
              activity_type_id: type.id,
              member_id,
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

  await getAllMembersMetrics.trigger({ workspace_id });
});

const processDiscourse = async ({ user }: { user: UserWithWorkspace }) => {
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

  for (const channel of DISCOURSE_CHANNELS) {
    await createChannel({
      ...channel,
      workspace_id,
    });
  }

  return {
    discourse,
    discourseActivityTypes: filteredActivityTypes,
  };
};

const processLivestorm = async ({ user }: { user: UserWithWorkspace }) => {
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

const processGithub = async ({ user }: { user: UserWithWorkspace }) => {
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

const getNumActivities = (): number => {
  const roll = Math.random();

  if (roll < 0.25) return 0;
  if (roll < 0.6) return faker.number.int({ min: 3, max: 6 });
  if (roll < 0.85) return faker.number.int({ min: 9, max: 15 });
  if (roll < 0.95) return faker.number.int({ min: 18, max: 30 });
  if (roll < 0.99) return faker.number.int({ min: 33, max: 90 });

  return faker.number.int({ min: 93, max: 300 });
};
