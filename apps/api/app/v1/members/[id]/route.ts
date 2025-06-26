// import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
// import { sleep } from "@conquest/utils/sleep";
// import { client } from "@conquest/clickhouse/client";
// import { deleteMember } from "@conquest/clickhouse/member/deleteMember";
// import { getMember } from "@conquest/clickhouse/member/getMember";
// import { MemberSchema } from "@conquest/zod/schemas/member.schema";
// import { createZodRoute } from "next-zod-route";
// import { NextResponse } from "next/server";
// import { z } from "zod";

// const paramsSchema = z.object({
//   id: z.string(),
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
//   .params(paramsSchema)
//   .handler(async (_, { params }) => {
//     const { id } = params;

//     const member = await getMember({ id });

//     if (!member) {
//       return NextResponse.json(
//         {
//           code: "NOT_FOUND",
//           message: "Member not found",
//         },
//         { status: 404 },
//       );
//     }

//     return NextResponse.json({ member });
//   });

// export const PATCH = createZodRoute()
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
//   .params(paramsSchema)
//   .body(
//     MemberSchema.partial().omit({
//       id: true,
//       createdAt: true,
//       updatedAt: true,
//       workspaceId: true,
//     }),
//   )
//   .handler(async (_, { params, body }) => {
//     const { primaryEmail, emails, ...rest } = body;

//     const emailsArray = Array.from(
//       new Set([primaryEmail, ...(emails || [])]),
//     ).filter(Boolean);

//     const { id } = params;

//     const member = await getMember({ id });

//     if (!member) {
//       return NextResponse.json(
//         { code: "NOT_FOUND", message: "Member not found" },
//         { status: 404 },
//       );
//     }

//     const values = {
//       ...rest,
//       primaryEmail,
//       emails: emailsArray,
//       updatedAt: new Date(),
//     };

//     await client.insert({
//       table: "member",
//       values: [values],
//       format: "JSON",
//     });

//     await sleep(50);

//     const updatedMember = await getMember({ id });

//     return NextResponse.json({ member: updatedMember });
//   });

// export const DELETE = createZodRoute()
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
//   .params(paramsSchema)
//   .handler(async (_, { params }) => {
//     const { id } = params;

//     const member = await getMember({ id });

//     if (!member) {
//       return NextResponse.json(
//         { code: "NOT_FOUND", message: "Member not found" },
//         { status: 404 },
//       );
//     }

//     await deleteMember({ id });

//     return NextResponse.json({ success: true });
//   });
