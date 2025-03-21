import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
import { client } from "@conquest/clickhouse/client";
import { ActivitySchema } from "@conquest/zod/schemas/activity.schema";
import { createZodRoute } from "next-zod-route";
import { NextResponse } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  member_id: z.string(),
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  page_size: z.coerce.number().min(10).max(100).default(10),
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

    return next({ ctx: { workspace_id: result.workspace_id } });
  })
  .params(paramsSchema)
  .query(querySchema)
  .handler(async (_, { params, query }) => {
    const { member_id } = params;
    const { page, page_size } = query;

    const resultCount = await client.query({
      query: `
        SELECT COUNT(*) as total
        FROM activity
        WHERE member_id = '${member_id}'
      `,
      format: "JSON",
    });

    const json = await resultCount.json();
    const { data: count } = json as { data: Array<{ total: number }> };
    const total_activities = Number(count[0]?.total || 0);

    const result = await client.query({
      query: `
        SELECT * 
        FROM activity
        WHERE member_id = '${member_id}'
        ORDER BY created_at DESC
        LIMIT ${page_size}
        OFFSET ${(page - 1) * page_size}
      `,
      format: "JSON",
    });

    const { data } = await result.json();
    const activities = ActivitySchema.array().parse(data);

    return NextResponse.json({
      page,
      page_size,
      total_activities,
      activities,
    });
  });
