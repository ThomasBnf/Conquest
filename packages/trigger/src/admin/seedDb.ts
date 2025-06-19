import { prisma } from "@conquest/db/prisma";
import { Activity } from "@conquest/zod/schemas/activity.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import { Profile } from "@conquest/zod/schemas/profile.schema";
import { User } from "@conquest/zod/schemas/user.schema";
import { faker } from "@faker-js/faker";
import { logger } from "@trigger.dev/sdk/v3";
import { getLocaleByAlpha2 } from "country-locale-map";
import ISO6391 from "iso-639-1";
import { randomUUID } from "node:crypto";
import { getNumActivities } from "../seed/getNumActivities";
import { processDiscourse } from "../seed/processDiscourse";
import { processGithub } from "../seed/processGithub";
import { processLivestorm } from "../seed/processLivestorm";
import { getAllMembersMetrics } from "../tasks/getAllMembersMetrics";

type Props = {
  user: User;
};

export const seedDb = async ({ user }: Props) => {
  const { workspaceId } = user;

  const { channels, discourseActivityTypes } = await processDiscourse({
    user,
  });
  const { livestormActivityTypes, events } = await processLivestorm({ user });
  const { githubActivityTypes } = await processGithub({ user });

  const TOTAL_MEMBERS = 250;
  const memberIds: string[] = [];

  const members: Member[] = [];
  const profiles: Profile[] = [];

  for (let i = 0; i < TOTAL_MEMBERS; i++) {
    const memberId = randomUUID();
    memberIds.push(memberId);

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const primaryEmail = faker.internet.email({
      firstName,
      lastName,
      provider: faker.company
        .catchPhraseNoun()
        .toLowerCase()
        .replace(" ", "-")
        .concat(".com"),
    });

    let language = "";
    const country = faker.helpers.arrayElement(["FR", "US", "GB", "DE", "CA"]);
    const locale = getLocaleByAlpha2(country.toUpperCase());
    const languageCode = locale?.split("_")[0] ?? "";
    language = languageCode ? ISO6391.getName(languageCode) : "";

    const createdAt = faker.date.recent({ days: 180 });

    members.push({
      id: memberId,
      firstName,
      lastName,
      primaryEmail: primaryEmail.toLowerCase(),
      emails: [primaryEmail.toLowerCase()],
      phones: [faker.phone.number({ style: "international" })],
      jobTitle: faker.person.jobTitle(),
      avatarUrl: faker.image.avatar(),
      country,
      language,
      tags: [],
      linkedinUrl: "",
      levelNumber: null,
      pulse: 0,
      source: "Discourse",
      atRiskMember: false,
      potentialAmbassador: false,
      customFields: [],
      companyId: null,
      isStaff: false,
      workspaceId,
      firstActivity: null,
      lastActivity: null,
      createdAt,
      updatedAt: createdAt,
    });

    profiles.push({
      id: randomUUID(),
      externalId: randomUUID(),
      attributes: {
        source: "Discourse",
        customFields: [
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
      memberId: memberId,
      workspaceId,
      createdAt,
      updatedAt: createdAt,
    });
  }

  await prisma.$transaction([
    prisma.member.createMany({ data: members }),
    prisma.profile.createMany({ data: profiles }),
  ]);

  logger.info("Finished inserting members");

  const livestormActivityData: Activity[] = [];
  const hasLivestormProfile = new Set<string>();

  for (const event of events) {
    const participatingMembers = faker.helpers.arrayElements(memberIds, {
      min: Math.floor(TOTAL_MEMBERS * 0.1),
      max: Math.floor(TOTAL_MEMBERS * 0.3),
    });

    for (const memberId of participatingMembers) {
      const roll = Math.random();
      let type: "livestorm:register" | "livestorm:attend" | "livestorm:co-host";

      if (roll < 0.02) {
        type = "livestorm:co-host";
      } else if (roll < 0.5) {
        type = "livestorm:attend";
      } else {
        type = "livestorm:register";
      }

      const activityType = livestormActivityTypes.find((a) => a.key === type);
      if (!activityType) continue;

      const createdAt = faker.date.between({
        from: event.startedAt,
        to: event.endedAt ?? new Date(),
      });

      livestormActivityData.push({
        id: randomUUID(),
        externalId: null,
        activityTypeKey: activityType.key,
        title: event.title,
        message: `Co-hosted : ${event.title}`,
        replyTo: null,
        reactTo: null,
        inviteTo: null,
        channelId: null,
        eventId: event.id,
        memberId,
        workspaceId,
        source: "Livestorm",
        createdAt,
        updatedAt: createdAt,
      });

      hasLivestormProfile.add(memberId);
    }
  }

  await prisma.activity.createMany({ data: livestormActivityData });
  logger.info("Finished inserting livestorm activities");

  const livestormProfileData = Array.from(hasLivestormProfile).map(
    (memberId) => ({
      id: randomUUID(),
      externalId: randomUUID(),
      attributes: {
        source: "Livestorm",
      },
      memberId,
      createdAt: faker.date.recent({ days: 180 }),
      workspaceId,
    }),
  );

  await prisma.profile.createMany({ data: livestormProfileData });
  logger.info("Finished inserting livestorm profiles");

  const discourseActivityData: Activity[] = [];

  for (const memberId of memberIds) {
    const NUM_ACTIVITIES = getNumActivities();

    for (let i = 0; i < NUM_ACTIVITIES; i++) {
      const type = faker.helpers.arrayElement(discourseActivityTypes);
      const createdAt = faker.date.recent({ days: 180 });

      discourseActivityData.push({
        id: randomUUID(),
        externalId: null,
        activityTypeKey: type.key,
        title: "",
        message: "Replied to a topic",
        replyTo: null,
        reactTo: null,
        inviteTo: null,
        channelId: null,
        eventId: null,
        memberId,
        workspaceId,
        source: "Discourse",
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  await prisma.activity.createMany({ data: discourseActivityData });
  logger.info("Finished inserting discourse activities");

  // GitHub activities
  const githubActivityData: Activity[] = [];

  const hasGithubProfile = new Set<string>();

  for (const memberId of memberIds) {
    const NUM_ACTIVITIES = getNumActivities();

    for (let i = 0; i < NUM_ACTIVITIES; i++) {
      const type = faker.helpers.arrayElement(githubActivityTypes);
      const channel = faker.helpers.arrayElement(channels);
      const createdAt = faker.date.recent({ days: 180 });

      githubActivityData.push({
        id: randomUUID(),
        externalId: null,
        activityTypeKey: type.key,
        title: "",
        message: "Starred a repository",
        replyTo: null,
        reactTo: null,
        inviteTo: null,
        channelId: channel.id,
        eventId: null,
        memberId,
        workspaceId,
        source: "Github",
        createdAt,
        updatedAt: createdAt,
      });

      hasGithubProfile.add(memberId);
    }
  }

  await prisma.activity.createMany({ data: githubActivityData });
  logger.info("Finished inserting github activities");

  // GitHub profiles
  const githubProfileData = Array.from(hasGithubProfile).map((memberId) => ({
    id: randomUUID(),
    externalId: randomUUID(),
    attributes: {
      source: "Github",
      login: faker.internet.username(),
      bio: faker.lorem.paragraph(),
      blog: faker.internet.url(),
      location: faker.location.city(),
      followers: faker.number.int({ min: 0, max: 1000 }),
    },
    memberId,
    createdAt: faker.date.recent({ days: 180 }),
    workspaceId,
  }));

  await prisma.profile.createMany({ data: githubProfileData });
  logger.info("Finished inserting github profiles");

  await getAllMembersMetrics.trigger({ workspaceId });
};
