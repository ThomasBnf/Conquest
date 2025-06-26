// import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
// import { client } from "@conquest/clickhouse/client";
// import { deleteCompany } from "@conquest/clickhouse/company/deleteCompany";
// import { getCompany } from "@conquest/clickhouse/company/getCompany";
// import { sleep } from "@conquest/utils/sleep";
// import { CompanySchema } from "@conquest/zod/schemas/company.schema";
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

//     const company = await getCompany({ id });

//     if (!company) {
//       return NextResponse.json(
//         {
//           code: "NOT_FOUND",
//           message: "Company not found",
//         },
//         { status: 404 },
//       );
//     }

//     return NextResponse.json({ company });
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
//     CompanySchema.partial().omit({
//       id: true,
//       createdAt: true,
//       updatedAt: true,
//       workspaceId: true,
//     }),
//   )
//   .handler(async (_, { params, body }) => {
//     const { id } = params;

//     const company = await getCompany({ id });

//     if (!company) {
//       return NextResponse.json(
//         { code: "NOT_FOUND", message: "Company not found" },
//         { status: 404 },
//       );
//     }

//     const values = Object.entries(body)
//       .map(([key, value]) => `${key} = '${value}'`)
//       .join(", ");

//     await client.query({
//       query: `
//           ALTER TABLE company
//           UPDATE
//             ${values},
//             updatedAt = now()
//           WHERE id = '${id}'
//       `,
//     });

//     await sleep(50);

//     const updatedCompany = await getCompany({ id });

//     return NextResponse.json({ company: updatedCompany });
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

//     const company = await getCompany({ id });

//     if (!company) {
//       return NextResponse.json(
//         { code: "NOT_FOUND", message: "Company not found" },
//         { status: 404 },
//       );
//     }

//     await deleteCompany({ id });

//     return NextResponse.json({ success: true });
//   });
