import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
import { sleep } from "@conquest/utils/sleep";
import { client } from "@conquest/clickhouse/client";
import { getMember } from "@conquest/clickhouse/member/getMember";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
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
        FROM member FINAL
        WHERE workspaceId = '${workspaceId}'
      `,
      format: "JSON",
    });

    const json = await resultCount.json();
    const { data: count } = json as { data: Array<{ total: number }> };
    const totalMembers = Number(count[0]?.total || 0);

    const result = await client.query({
      query: `
        SELECT * 
        FROM member FINAL
        WHERE workspaceId = '${workspaceId}'  
        ORDER BY createdAt DESC
        LIMIT ${pageSize}
        OFFSET ${(page - 1) * pageSize}
      `,
      format: "JSON",
    });

    const { data } = await result.json();
    const members = MemberSchema.array().parse(data);

    return NextResponse.json({
      page,
      pageSize,
      totalMembers,
      members,
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
    MemberSchema.partial().omit({
      id: true,
      pulse: true,
      levelId: true,
      firstActivity: true,
      lastActivity: true,
      source: true,
      createdAt: true,
      updatedAt: true,
      workspaceId: true,
    }),
  )
  .handler(async (_, { ctx, body }) => {
    const { workspaceId } = ctx;
    const { primaryEmail, emails = [], ...rest } = body;

    const emailsArray = Array.from(
      new Set([primaryEmail, ...(emails || [])]),
    ).filter(Boolean);

    const id = randomUUID();

    const values = {
      id,
      ...rest,
      primaryEmail,
      emails: emailsArray,
      source: "Api",
      workspaceId,
    };

    await client.insert({
      table: "member",
      values: [values],
      format: "JSON",
    });

    await sleep(50);

    const member = await getMember({ id });

    if (!member) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Failed to create member" },
        { status: 404 },
      );
    }

    return NextResponse.json({ member });
  });
