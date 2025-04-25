import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
import { getActivityTypeByKey } from "@conquest/clickhouse/activity-types/getActivityTypeByKey";
import { client } from "@conquest/clickhouse/client";
import { ActivitySchema } from "@conquest/zod/schemas/activity.schema";
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
        FROM activity
        WHERE id = '${id}'
        AND workspaceId = '${workspaceId}'
      `,
      format: "JSON",
    });

    const { data } = await result.json();
    const activity = ActivitySchema.parse(data[0]);

    return NextResponse.json({ activity });
  });

export const PATCH = createZodRoute()
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
      id: z.string(),
      activityKey: z.string().optional(),
      ...ActivitySchema.omit({ id: true }).partial().shape,
    }),
  )
  .handler(async (_, { ctx, params, body }) => {
    const { workspaceId } = ctx;
    const { id } = params;
    const { activityKey, ...rest } = body;

    let activityTypeId = null;

    if (activityKey) {
      const activityType = await getActivityTypeByKey({
        key: activityKey,
        workspaceId,
      });
      activityTypeId = activityType?.id;
    }

    const values = Object.entries(rest)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(", ");

    await client.query({
      query: `
        ALTER TABLE activity
        UPDATE 
          ${values}, 
          ${activityTypeId ? `activityTypeId = '${activityTypeId}',` : ""}
          updatedAt = now()
        WHERE id = '${id}' 
        AND workspaceId = '${workspaceId}'
      `,
      format: "JSON",
    });

    const result = await client.query({
      query: `
        SELECT * 
        FROM activity
        WHERE id = '${id}'
        AND workspaceId = '${workspaceId}'
      `,
      format: "JSON",
    });

    const { data } = await result.json();
    const activity = ActivitySchema.parse(data[0]);

    return NextResponse.json({ activity });
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
        ALTER TABLE activity
        DELETE
        WHERE id = '${id}'
        AND workspaceId = '${workspaceId}'
      `,
      format: "JSON",
    });

    return NextResponse.json({ success: true });
  });
