import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
import { getChannel } from "@conquest/clickhouse/channels/getChannel";
import { client } from "@conquest/clickhouse/client";
import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
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
        FROM channel
        WHERE workspaceId = '${workspaceId}'
      `,
      format: "JSON",
    });

    const json = await resultCount.json();
    const { data: count } = json as { data: Array<{ total: number }> };
    const totalChannels = Number(count[0]?.total || 0);

    const result = await client.query({
      query: `
        SELECT * 
        FROM channel
        WHERE workspaceId = '${workspaceId}'
        ORDER BY createdAt DESC
        LIMIT ${pageSize}
        OFFSET ${(page - 1) * pageSize}
      `,
      format: "JSON",
    });

    const { data } = await result.json();
    const channels = ChannelSchema.array().parse(data);

    return NextResponse.json({
      page,
      pageSize,
      totalChannels,
      channels,
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
      table: "channel",
      values: {
        id,
        externalId,
        name,
        source: "Api",
        workspaceId,
      },
      format: "JSON",
    });

    const channel = await getChannel({ id });

    if (!channel) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Failed to create channel" },
        { status: 404 },
      );
    }

    return NextResponse.json({ channel });
  });
