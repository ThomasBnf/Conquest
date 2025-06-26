// import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
// import { sleep } from "@conquest/utils/sleep";
// import { getActivityTypeByKey } from "@conquest/clickhouse/activity-type/getActivityTypeByKey";
// import { getActivity } from "@conquest/clickhouse/activity/getActivity";
// import { getChannel } from "@conquest/clickhouse/channel/getChannel";
// import { client } from "@conquest/clickhouse/client";
// import { getMember } from "@conquest/clickhouse/member/getMember";
// import { getEvent } from "@conquest/db/events/getEvent";
// import { ActivitySchema } from "@conquest/zod/schemas/activity.schema";
// import { createZodRoute } from "next-zod-route";
// import { NextResponse } from "next/server";
// import { randomUUID } from "node:crypto";
// import { z } from "zod";

// const querySchema = z.object({
//   page: z.coerce.number().min(1).default(1),
//   pageSize: z.coerce.number().min(10).max(100).default(10),
// });

// export const GET = createZodRoute()
//   .use(async ({ request, next }) => {
//     const result = await getAuthenticatedUser(request);

//     if ("error" in result) {
//       return NextResponse.json(
//         { code: result.error?.code, message: result.error?.message },
//         { status: result.error?.status },
//       );
//     }

//     return next({ ctx: { workspaceId: result.workspaceId } });
//   })
//   .query(querySchema)
//   .handler(async (_, { ctx, query }) => {
//     const { workspaceId } = ctx;
//     const { page, pageSize } = query;

//     const resultCount = await client.query({
//       query: `
//         SELECT COUNT(*) as total
//         FROM activity
//         WHERE workspaceId = '${workspaceId}'
//       `,
//       format: "JSON",
//     });

//     const json = await resultCount.json();
//     const { data: count } = json as { data: Array<{ total: number }> };
//     const totalActivities = Number(count[0]?.total || 0);

//     const result = await client.query({
//       query: `
//         SELECT *
//         FROM activity
//         WHERE workspaceId = '${workspaceId}'
//         ORDER BY createdAt DESC
//         LIMIT ${pageSize}
//         OFFSET ${(page - 1) * pageSize}
//       `,
//       format: "JSON",
//     });

//     const { data } = await result.json();
//     const activities = ActivitySchema.array().parse(data);

//     return NextResponse.json({
//       page,
//       pageSize,
//       totalActivities,
//       activities,
//     });
//   });

// export const POST = createZodRoute()
//   .use(async ({ request, next }) => {
//     const result = await getAuthenticatedUser(request);

//     if ("error" in result) {
//       return NextResponse.json(
//         { code: result.error?.code, message: result.error?.message },
//         { status: result.error?.status },
//       );
//     }

//     return next({ ctx: { workspaceId: result.workspaceId } });
//   })
//   .body(
//     ActivitySchema.partial().extend({
//       activityTypeKey: z.string(),
//       replyTo: z.string().uuid().optional(),
//       reactTo: z.string().uuid().optional(),
//       inviteTo: z.string().uuid().optional(),
//       channelId: z.string().uuid().optional(),
//       eventId: z.string().uuid().optional(),
//       memberId: z.string().uuid(),
//     }),
//   )
//   .handler(async (_, { ctx, body }) => {
//     const { workspaceId } = ctx;
//     const {
//       activityTypeKey,
//       replyTo,
//       reactTo,
//       inviteTo,
//       channelId,
//       eventId,
//       memberId,
//       ...rest
//     } = body;

//     const source = activityTypeKey.split(":")[0];

//     if (source !== "api") {
//       return NextResponse.json(
//         {
//           code: "BAD_REQUEST",
//           message:
//             "Invalid activity type key, Activity type key must start with 'api:'",
//         },
//         { status: 400 },
//       );
//     }

//     const verifications = [
//       { id: replyTo, type: "replyTo" },
//       { id: reactTo, type: "reactTo" },
//       { id: inviteTo, type: "inviteTo" },
//     ];

//     for (const { id, type } of verifications) {
//       if (!id) continue;

//       const activity = await getActivity({ id });

//       if (!activity) {
//         return NextResponse.json(
//           {
//             code: "NOT_FOUND",
//             message: `Activity not found, '${type}' is not a valid activity id`,
//           },
//           { status: 404 },
//         );
//       }
//     }

//     if (channelId) {
//       const channel = await getChannel({ id: channelId });

//       if (!channel) {
//         return NextResponse.json(
//           {
//             code: "NOT_FOUND",
//             message: "Channel not found",
//           },
//           { status: 404 },
//         );
//       }
//     }

//     if (eventId) {
//       const event = await getEvent({ id: eventId });

//       if (!event) {
//         return NextResponse.json(
//           { code: "NOT_FOUND", message: "Event not found" },
//           { status: 404 },
//         );
//       }
//     }

//     if (memberId) {
//       const member = await getMember({ id: memberId });

//       if (!member) {
//         return NextResponse.json(
//           { code: "NOT_FOUND", message: "Member not found" },
//           { status: 404 },
//         );
//       }
//     }

//     const activityType = await getActivityTypeByKey({
//       key: activityTypeKey,
//       workspaceId,
//     });

//     if (!activityType) {
//       return NextResponse.json(
//         {
//           code: "NOT_FOUND",
//           message: "Activity type not found",
//         },
//         { status: 404 },
//       );
//     }

//     const id = randomUUID();

//     const values = {
//       id,
//       activityTypeId: activityType.id,
//       workspaceId,
//       source: "Api",
//       replyTo,
//       reactTo,
//       inviteTo,
//       channelId,
//       eventId,
//       memberId,
//       ...rest,
//     };

//     await client.insert({
//       table: "activity",
//       values: [values],
//       format: "JSON",
//     });

//     await sleep(50);

//     const activity = await getActivity({ id });

//     if (!activity) {
//       return NextResponse.json(
//         { code: "NOT_FOUND", message: "Failed to create activity" },
//         { status: 404 },
//       );
//     }

//     return NextResponse.json({ activity });
//   });
