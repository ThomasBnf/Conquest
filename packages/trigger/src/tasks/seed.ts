import { client } from "@conquest/clickhouse/client";
import { getCompanyByDomain } from "@conquest/clickhouse/companies/getCompanyByDomain";
import { filteredDomain } from "@conquest/clickhouse/helpers/filteredDomain";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { UserWithWorkspaceSchema } from "@conquest/zod/schemas/user.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { v4 as uuid } from "uuid";
import { z } from "zod";

export const seed = schemaTask({
  id: "seed",
  machine: "small-2x",
  schema: z.object({
    user: UserWithWorkspaceSchema,
  }),
  run: async ({ user }) => {
    if (user.role !== "STAFF") return;

    const result = await client.query({
      query: `
        SELECT *
        FROM member FINAL
        WHERE primaryEmail != ''
      `,
    });

    const { data } = await result.json();
    const members = MemberSchema.array().parse(data);

    await client.query({
      query: `
       ALTER TABLE company
       DELETE WHERE 1=1;
      `,
    });

    for (const member of members) {
      const { primaryEmail, source, workspaceId } = member;

      const formattedEmail = primaryEmail?.toLowerCase().trim();

      const domain = formattedEmail?.split("@")[1];
      if (!domain) continue;

      const companyName = filteredDomain(domain);
      if (!companyName) continue;

      const company = await getCompanyByDomain({
        domain: `https://${domain}`,
        workspaceId,
      });

      if (!company) {
        const id = uuid();

        await client.insert({
          table: "company",
          values: [
            {
              id,
              name: companyName,
              domain: `https://${domain}`,
              source,
              workspaceId,
            },
          ],
          format: "JSON",
        });

        await client.insert({
          table: "member",
          values: [
            {
              ...member,
              companyId: id,
              updatedAt: new Date(),
            },
          ],
          format: "JSON",
        });

        continue;
      }

      await client.insert({
        table: "member",
        values: [
          {
            ...member,
            companyId: company?.id,
            updatedAt: new Date(),
          },
        ],
        format: "JSON",
      });
    }

    //   const { workspaceId } = user;

    //   const { channels, discourseActivityTypes } = await processDiscourse({
    //     user,
    //   });
    //   const { livestormActivityTypes, events } = await processLivestorm({ user });
    //   const { githubActivityTypes } = await processGithub({ user });

    //   const TOTAL_MEMBERS = 250;
    //   const inserts = [];
    //   const memberIds: string[] = [];

    //   for (let i = 0; i < TOTAL_MEMBERS; i++) {
    //     const memberId = randomUUID();
    //     memberIds.push(memberId);

    //     const firstName = faker.person.firstName();
    //     const lastName = faker.person.lastName();
    //     const primaryEmail = faker.internet.email({
    //       firstName,
    //       lastName,
    //       provider: faker.company
    //         .catchPhraseNoun()
    //         .toLowerCase()
    //         .replace(" ", "-")
    //         .concat(".com"),
    //     });

    //     let language = "";

    //     const country = faker.helpers.arrayElement([
    //       "FR",
    //       "US",
    //       "GB",
    //       "DE",
    //       "CA",
    //     ]);

    //     const locale = getLocaleByAlpha2(country.toUpperCase());
    //     const languageCode = locale?.split("_")[0] ?? "";
    //     language = languageCode ? ISO6391.getName(languageCode) : "";

    //     const createdAt = faker.date
    //       .recent({ days: 180 })
    //       .toISOString()
    //       .replace("T", " ")
    //       .substring(0, 19);

    //     inserts.push(
    //       client.insert({
    //         table: "member",
    //         values: [
    //           {
    //             id: memberId,
    //             firstName,
    //             lastName,
    //             primaryEmail: primaryEmail.toLowerCase(),
    //             emails: [primaryEmail.toLowerCase()],
    //             phones: [faker.phone.number({ style: "international" })],
    //             jobTitle: faker.person.jobTitle(),
    //             avatarUrl: faker.image.avatar(),
    //             country,
    //             language,
    //             source: "Discourse",
    //             createdAt,
    //             workspaceId,
    //           },
    //         ],
    //         format: "JSON",
    //       }),
    //     );

    //     inserts.push(
    //       client.insert({
    //         table: "profile",
    //         values: [
    //           {
    //             externalId: randomUUID(),
    //             attributes: {
    //               source: "Discourse",
    //               username: faker.internet.username(),
    //               customFields: [
    //                 {
    //                   id: "1",
    //                   value: faker.internet.url(),
    //                 },
    //                 {
    //                   id: "2",
    //                   value: faker.datatype.boolean().toString(),
    //                 },
    //                 {
    //                   id: "3",
    //                   value: faker.datatype.boolean().toString(),
    //                 },
    //               ],
    //             },
    //             memberId: memberId,
    //             workspaceId,
    //           },
    //         ],
    //         format: "JSON",
    //       }),
    //     );
    //   }

    //   await Promise.all(inserts);

    //   logger.info("Finished inserting members");

    //   const activityInserts = [];
    //   const hasLivestormProfile = new Set<string>();

    //   for (const event of events) {
    //     const participatingMembers = faker.helpers.arrayElements(memberIds, {
    //       min: Math.floor(TOTAL_MEMBERS * 0.1),
    //       max: Math.floor(TOTAL_MEMBERS * 0.3),
    //     });

    //     for (const memberId of participatingMembers) {
    //       const roll = Math.random();

    //       let type:
    //         | "livestorm:register"
    //         | "livestorm:attend"
    //         | "livestorm:co-host";

    //       if (roll < 0.02) {
    //         type = "livestorm:co-host";
    //       } else if (roll < 0.5) {
    //         type = "livestorm:attend";
    //       } else {
    //         type = "livestorm:register";
    //       }

    //       const activityType = livestormActivityTypes.find((a) => a.key === type);
    //       if (!activityType) continue;

    //       const createdAt = faker.date
    //         .between({
    //           from: event.startedAt,
    //           to: event.endedAt ?? new Date(),
    //         })
    //         .toISOString()
    //         .replace("T", " ")
    //         .substring(0, 19);

    //       activityInserts.push(
    //         client.insert({
    //           table: "activity",
    //           values: [
    //             {
    //               id: randomUUID(),
    //               activityTypeId: activityType.id,
    //               memberId,
    //               eventId: event.id,
    //               workspaceId,
    //               source: "Livestorm",
    //               createdAt,
    //             },
    //           ],
    //           format: "JSON",
    //         }),
    //       );

    //       hasLivestormProfile.add(memberId);
    //     }
    //   }

    //   await Promise.all(activityInserts);

    //   logger.info("Finished inserting livestorm activities");

    //   const livestormProfileInserts = [];

    //   for (const memberId of hasLivestormProfile) {
    //     livestormProfileInserts.push(
    //       client.insert({
    //         table: "profile",
    //         values: [
    //           {
    //             externalId: randomUUID(),
    //             attributes: {
    //               source: "Livestorm",
    //             },
    //             memberId,
    //             workspaceId,
    //           },
    //         ],
    //         format: "JSON",
    //       }),
    //     );
    //   }

    //   await Promise.all(livestormProfileInserts);

    //   logger.info("Finished inserting livestorm profiles");

    //   const discourseActivityInserts = [];

    //   for (const memberId of memberIds) {
    //     const NUM_ACTIVITIES = getNumActivities();

    //     for (let i = 0; i < NUM_ACTIVITIES; i++) {
    //       const type = faker.helpers.arrayElement(discourseActivityTypes);

    //       const createdAt = faker.date
    //         .recent({ days: 365 })
    //         .toISOString()
    //         .replace("T", " ")
    //         .substring(0, 19);

    //       discourseActivityInserts.push(
    //         client.insert({
    //           table: "activity",
    //           values: [
    //             {
    //               id: randomUUID(),
    //               activityTypeId: type.id,
    //               memberId,
    //               workspaceId,
    //               source: "Discourse",
    //               createdAt,
    //             },
    //           ],
    //           format: "JSON",
    //         }),
    //       );
    //     }
    //   }

    //   await Promise.all(discourseActivityInserts);

    //   logger.info("Finished inserting discourse activities");

    //   const githubActivityInserts = [];
    //   const hasGithubProfile = new Set<string>();

    //   for (const memberId of memberIds) {
    //     const NUM_ACTIVITIES = getNumActivities();

    //     for (let i = 0; i < NUM_ACTIVITIES; i++) {
    //       const type = faker.helpers.arrayElement(githubActivityTypes);
    //       const channel = faker.helpers.arrayElement(channels);

    //       const createdAt = faker.date
    //         .recent({ days: 365 })
    //         .toISOString()
    //         .replace("T", " ")
    //         .substring(0, 19);

    //       githubActivityInserts.push(
    //         client.insert({
    //           table: "activity",
    //           values: [
    //             {
    //               id: randomUUID(),
    //               activityTypeId: type.id,
    //               memberId,
    //               channelId: channel.id,
    //               workspaceId,
    //               source: "Github",
    //               createdAt,
    //             },
    //           ],
    //           format: "JSON",
    //         }),
    //       );

    //       hasGithubProfile.add(memberId);
    //     }
    //   }

    //   await Promise.all(githubActivityInserts);

    //   logger.info("Finished inserting github activities");

    //   const githubProfileInserts = [];

    //   for (const memberId of hasGithubProfile) {
    //     githubProfileInserts.push(
    //       client.insert({
    //         table: "profile",
    //         values: [
    //           {
    //             externalId: randomUUID(),
    //             attributes: {
    //               source: "Github",
    //               login: faker.internet.username(),
    //               bio: faker.lorem.paragraph(),
    //               blog: faker.internet.url(),
    //               location: faker.location.city(),
    //               followers: faker.number.int({ min: 0, max: 1000 }),
    //             },
    //             memberId,
    //             workspaceId,
    //           },
    //         ],
    //         format: "JSON",
    //       }),
    //     );
    //   }

    //   await Promise.all(githubProfileInserts);

    //   logger.info("Finished inserting github profiles");

    //   await getAllMembersMetrics.trigger({ workspaceId });
  },
});
