import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";
import { faker } from "@faker-js/faker";
import { getLocaleByAlpha2 } from "country-locale-map";
import { prisma } from "../prisma";
import { calculateMemberMetrics } from "../queries/dashboard/calculateMemberMetrics";

const EUROPEAN_COUNTRIES = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
];

async function seedDb() {
  const workspace = WorkspaceSchema.parse(await prisma.workspaces.findFirst());

  const activities_types = ActivityTypeSchema.array().parse(
    await Promise.all(
      [
        {
          name: "Invite",
          source: "DISCOURSE" as const,
          key: "discourse:invite",
          weight: 7,
          channels: [],
          deletable: false,
          workspace_id: workspace.id,
        },
        {
          name: "Post marked as solved",
          source: "DISCOURSE" as const,
          key: "discourse:solved",
          weight: 7,
          deletable: false,
          workspace_id: workspace.id,
        },
        {
          name: "Write a topic",
          source: "DISCOURSE" as const,
          key: "discourse:topic",
          weight: 6,
          deletable: false,
          workspace_id: workspace.id,
        },
        {
          name: "Reply to topic",
          source: "DISCOURSE" as const,
          key: "discourse:reply",
          weight: 5,
          deletable: false,
          workspace_id: workspace.id,
        },
        {
          name: "Join Discourse community",
          source: "DISCOURSE" as const,
          key: "discourse:join",
          weight: 4,
          deletable: false,
          workspace_id: workspace.id,
        },
        {
          name: "Login",
          source: "DISCOURSE" as const,
          key: "discourse:login",
          weight: 0,
          deletable: false,
          workspace_id: workspace.id,
        },
        {
          name: "Add reaction",
          source: "DISCOURSE" as const,
          key: "discourse:reaction",
          weight: 0,
          deletable: false,
          workspace_id: workspace.id,
        },
      ].map((data) => prisma.activities_types.create({ data })),
    ),
  );

  const members = Array.from({ length: 3253 }, () => {
    const id = faker.string.uuid();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const country = faker.helpers.arrayElement(EUROPEAN_COUNTRIES);
    const locale = getLocaleByAlpha2(country);

    const createdAt = faker.date.between({
      from: "2024-01-01",
      to: new Date(),
    });

    return {
      discourse_id: faker.string.uuid(),
      discourse_username: `${firstName.toLowerCase()}${lastName.toLowerCase()}_${id}`,
      first_name: firstName,
      last_name: lastName,
      primary_email: faker.internet
        .email({ firstName, lastName })
        .toLowerCase(),
      phones: [faker.phone.number({ style: "international" })],
      job_title: faker.person.jobTitle(),
      avatar_url: faker.image.avatar(),
      locale,
      source: "DISCOURSE" as const,
      workspace_id: workspace.id,
      created_at: createdAt,
      updated_at: createdAt,
    };
  });

  await prisma.members.createMany({ data: members });

  const createdMembers = MemberSchema.array().parse(
    await prisma.members.findMany({
      where: {
        workspace_id: workspace.id,
      },
    }),
  );

  const activities = createdMembers.flatMap((member) => {
    const numActivities = faker.helpers.weightedArrayElement([
      { weight: 5, value: faker.number.int({ min: 20, max: 100 }) },
      { weight: 5, value: faker.number.int({ min: 10, max: 20 }) },
      { weight: 20, value: faker.number.int({ min: 0, max: 10 }) },
      { weight: 70, value: faker.number.int(0) },
    ]);

    return Array.from({ length: numActivities }, () => {
      const activityType = faker.helpers.weightedArrayElement([
        {
          weight: 8,
          value: "discourse:login",
        },
        {
          weight: 1,
          value: "discourse:solved",
        },
        {
          weight: 1,
          value: "discourse:invite",
        },
        {
          weight: 10,
          value: "discourse:reply",
        },
        {
          weight: 40,
          value: "discourse:reaction",
        },
        {
          weight: 40,
          value: "discourse:topic",
        },
      ]);

      const activity_type = activities_types.find(
        (activity_type) => activity_type.key === activityType,
      );

      const createdAt = faker.date.between({
        from: member.created_at,
        to: new Date(),
      });

      return {
        external_id: faker.string.uuid(),
        title:
          activity_type?.key === "discourse:topic"
            ? faker.lorem.sentence()
            : null,
        message:
          activity_type?.key === "discourse:reaction"
            ? "like"
            : faker.lorem.paragraph(),
        activity_type_id: activity_type?.id ?? "",
        member_id: member.id,
        workspace_id: workspace.id,
        created_at: createdAt,
        updated_at: createdAt,
      };
    });
  });

  await prisma.activities.createMany({ data: activities });

  for (const member of createdMembers) {
    await calculateMemberMetrics({ member });
  }
}

seedDb()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
