import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
import { client } from "@conquest/clickhouse/client";
import { getCompany } from "@conquest/clickhouse/companies/getCompany";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { createZodRoute } from "next-zod-route";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(10).max(100).default(10),
});

export const GET = createZodRoute()
  .use(async ({ request, next }) => {
    const result = await getAuthenticatedUser(request);

    if ("error" in result) {
      return NextResponse.json(
        { code: result.error?.code, message: result.error?.message },
        { status: result.error?.status },
      );
    }

    return next({ ctx: { workspaceId: result.workspaceId } });
  })
  .query(querySchema)
  .handler(async (_, { ctx, query }) => {
    const { workspaceId } = ctx;
    const { page, pageSize } = query;

    const resultCount = await client.query({
      query: `
        SELECT COUNT(*) as total
        FROM company
        WHERE workspaceId = '${workspaceId}'
      `,
      format: "JSON",
    });

    const json = await resultCount.json();
    const { data: count } = json as { data: Array<{ total: number }> };
    const totalCompanies = Number(count[0]?.total || 0);

    const result = await client.query({
      query: `
        SELECT * 
        FROM company
        WHERE workspaceId = '${workspaceId}'
        ORDER BY createdAt DESC
        LIMIT ${pageSize}
        OFFSET ${(page - 1) * pageSize}
      `,
      format: "JSON",
    });

    const { data } = await result.json();
    const companies = CompanySchema.array().parse(data);

    return NextResponse.json({
      page,
      pageSize,
      totalCompanies,
      companies,
    });
  });

export const POST = createZodRoute()
  .use(async ({ request, next }) => {
    const result = await getAuthenticatedUser(request);

    if ("error" in result) {
      return NextResponse.json(
        { code: result.error?.code, message: result.error?.message },
        { status: result.error?.status },
      );
    }

    return next({ ctx: { workspaceId: result.workspaceId } });
  })
  .body(
    z.object({
      externalId: z.string(),
      name: z.string(),
    }),
  )
  .handler(async (_, { ctx, body }) => {
    const { workspaceId } = ctx;
    const { externalId, name } = body;

    const id = randomUUID();

    await client.insert({
      table: "company",
      values: {
        id,
        externalId,
        name,
        source: "Api",
        workspaceId,
      },
      format: "JSON",
    });

    const company = await getCompany({ id });

    if (!company) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Failed to create company" },
        { status: 404 },
      );
    }

    return NextResponse.json({ company });
  });
