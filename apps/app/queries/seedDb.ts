// "use server";

// import { EUROPEAN_COUNTRIES } from "@/constant";
// import { authAction } from "@/lib/authAction";
// import { prisma } from "@conquest/db/prisma";
// import { calculateMemberMetrics } from "@conquest/db/queries/dashboard/calculateMemberMetrics";
// import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
// import { MemberSchema } from "@conquest/zod/schemas/member.schema";
// import { faker } from "@faker-js/faker";
// import { getLocaleByAlpha2 } from "country-locale-map";

// export const seedDB = authAction
//   .metadata({
//     name: "seedDB",
//   })

//   .action(async ({ ctx: { user } }) => {
//     const { workspace_id } = user;

//     if (user.role !== "STAFF") return;

//     const activities_types = ActivityTypeSchema.array().parse(
//       await Promise.all(
//         [
//           {
//             name: "Invite",
//             source: "DISCOURSE" as const,
//             key: "discourse:invite",
//             weight: 7,
//             channels: [],
//             deletable: false,
//             workspace_id,
//           },
//           {
//             name: "Post marked as solved",
//             source: "DISCOURSE" as const,
//             key: "discourse:solved",
//             weight: 7,
//             deletable: false,
//             workspace_id,
//           },
//           {
//             name: "Write a topic",
//             source: "DISCOURSE" as const,
//             key: "discourse:topic",
//             weight: 6,
//             deletable: false,
//             workspace_id,
//           },
//           {
//             name: "Reply to topic",
//             source: "DISCOURSE" as const,
//             key: "discourse:reply",
//             weight: 5,
//             deletable: false,
//             workspace_id,
//           },
//           {
//             name: "Join Discourse community",
//             source: "DISCOURSE" as const,
//             key: "discourse:join",
//             weight: 4,
//             deletable: false,
//             workspace_id,
//           },
//           {
//             name: "Login",
//             source: "DISCOURSE" as const,
//             key: "discourse:login",
//             weight: 0,
//             deletable: false,
//             workspace_id,
//           },
//           {
//             name: "Add reaction",
//             source: "DISCOURSE" as const,
//             key: "discourse:reaction",
//             weight: 0,
//             deletable: false,
//             workspace_id,
//           },
//         ].map((data) => prisma.activity_type.create({ data })),
//       ),
//     );

//     const members = Array.from({ length: 3253 }, () => {
//       const id = faker.string.uuid();
//       const firstName = faker.person.firstName();
//       const lastName = faker.person.lastName();

//       const country = faker.helpers.arrayElement(EUROPEAN_COUNTRIES);
//       const locale = getLocaleByAlpha2(country);

//       const createdAt = faker.date.between({
//         from: "2024-01-01",
//         to: new Date(),
//       });

//       return {
//         discourse_id: faker.string.uuid(),
//         discourse_username: `${firstName.toLowerCase()}${lastName.toLowerCase()}_${id}`,
//         first_name: firstName,
//         last_name: lastName,
//         primary_email: faker.internet
//           .email({ firstName, lastName })
//           .toLowerCase(),
//         phones: [faker.phone.number({ style: "international" })],
//         job_title: faker.person.jobTitle(),
//         avatar_url: faker.image.avatar(),
//         locale,
//         source: "DISCOURSE" as const,
//         workspace_id,
//         created_at: createdAt,
//         updated_at: createdAt,
//       };
//     });

//     await prisma.member.createMany({ data: members });

//     const createdMembers = MemberSchema.array().parse(
//       await prisma.member.findMany({
//         where: {
//           workspace_id,
//         },
//       }),
//     );

//     const activities = createdMembers.flatMap((member) => {
//       const numActivities = faker.helpers.weightedArrayElement([
//         { weight: 5, value: faker.number.int({ min: 20, max: 100 }) },
//         { weight: 5, value: faker.number.int({ min: 10, max: 20 }) },
//         { weight: 20, value: faker.number.int({ min: 0, max: 10 }) },
//         { weight: 70, value: faker.number.int(0) },
//       ]);

//       return Array.from({ length: numActivities }, () => {
//         const activityType = faker.helpers.weightedArrayElement([
//           {
//             weight: 8,
//             value: "discourse:login",
//           },
//           {
//             weight: 1,
//             value: "discourse:solved",
//           },
//           {
//             weight: 1,
//             value: "discourse:invite",
//           },
//           {
//             weight: 10,
//             value: "discourse:reply",
//           },
//           {
//             weight: 40,
//             value: "discourse:reaction",
//           },
//           {
//             weight: 40,
//             value: "discourse:topic",
//           },
//         ]);

//         const activity_type = activities_types.find(
//           (activity_type) => activity_type.key === activityType,
//         );

//         const createdAt = faker.date.between({
//           from: member.created_at,
//           to: new Date(),
//         });

//         return {
//           external_id: faker.string.uuid(),
//           title:
//             activity_type?.key === "discourse:topic"
//               ? faker.lorem.sentence()
//               : null,
//           message:
//             activity_type?.key === "discourse:reaction"
//               ? "like"
//               : faker.lorem.paragraph(),
//           activity_type_id: activity_type?.id ?? "",
//           member_id: member.id,
//           workspace_id,
//           created_at: createdAt,
//           updated_at: createdAt,
//         };
//       });
//     });

//     await prisma.activity.createMany({ data: activities });

//     for (const member of createdMembers) {
//       await calculateMemberMetrics({ member });
//     }
//   });
