import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
import { client } from "@conquest/clickhouse/client";
import { ActivitySchema } from "@conquest/zod/schemas/activity.schema";
import { createZodRoute } from "next-zod-route";
import { NextResponse } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  memberId: z.string(),
});

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
  .params(paramsSchema)
  .query(querySchema)
  .handler(async (_, { ctx, params, query }) => {
    const { workspaceId } = ctx;
    const { memberId } = params;
    const { page, pageSize } = query;

    const resultCount = await client.query({
      query: `
        SELECT COUNT(*) as total
        FROM activity
        WHERE memberId = '${memberId}'
        AND workspaceId = '${workspaceId}'
      `,
      format: "JSON",
    });

    const json = await resultCount.json();
    const { data: count } = json as { data: Array<{ total: number }> };
    const totalActivities = Number(count[0]?.total || 0);

    const result = await client.query({
      query: `
        SELECT * 
        FROM activity
        WHERE memberId = '${memberId}'
        AND workspaceId = '${workspaceId}'
        ORDER BY createdAt DESC
        LIMIT ${pageSize}
        OFFSET ${(page - 1) * pageSize}
      `,
      format: "JSON",
    });

    const { data } = await result.json();
    const activities = ActivitySchema.array().parse(data);

    return NextResponse.json({
      page,
      pageSize,
      totalActivities,
      activities,
    });
  });
