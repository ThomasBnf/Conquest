import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
import { client } from "@conquest/clickhouse/client";
import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { createZodRoute } from "next-zod-route";
import { NextResponse } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string(),
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
  .handler(async (_, { ctx, params }) => {
    const { workspaceId } = ctx;
    const { id } = params;

    const result = await client.query({
      query: `
        SELECT * 
        FROM channel
        WHERE id = '${id}'
        AND workspaceId = '${workspaceId}'
      `,
      format: "JSON",
    });

    const { data } = await result.json();
    const channel = data[0];

    if (!channel) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "Channel not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ channel });
  });

export const PUT = createZodRoute()
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
  .params(
    z.object({
      id: z.string(),
    }),
  )
  .body(ChannelSchema.partial())
  .handler(async (_, { ctx, params, body }) => {
    const { workspaceId } = ctx;
    const { id } = params;

    const values = Object.entries(body)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(", ");

    const updateQuery = [values, "updatedAt = now()"]
      .filter(Boolean)
      .join(", ");

    await client.query({
      query: `
          ALTER TABLE channel
          UPDATE
            ${updateQuery}
          WHERE id = '${id}'
          AND workspaceId = '${workspaceId}'
      `,
    });

    return NextResponse.json({ success: true });
  });

export const DELETE = createZodRoute()
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
  .handler(async (_, { ctx, params }) => {
    const { workspaceId } = ctx;
    const { id } = params;

    await client.query({
      query: `
        ALTER TABLE channel
        DELETE
        WHERE id = '${id}'
        AND workspaceId = '${workspaceId}'
      `,
      format: "JSON",
    });

    return NextResponse.json({ success: true });
  });
