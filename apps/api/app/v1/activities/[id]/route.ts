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

    if (!activity) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "Activity not found",
        },
        { status: 404 },
      );
    }

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
  .params(
    z.object({
      id: z.string(),
    }),
  )
  .body(
    ActivitySchema.partial()
      .omit({
        id: true,
        source: true,
        workspaceId: true,
        createdAt: true,
        updatedAt: true,
      })
      .extend({
        activityTypeKey: z.string().optional(),
      }),
  )
  .handler(async (_, { ctx, params, body }) => {
    const { id } = params;
    const { workspaceId } = ctx;
    const { activityTypeKey, ...rest } = body;

    let activityTypeId = null;

    if (activityTypeKey) {
      const activityType = await getActivityTypeByKey({
        key: activityTypeKey,
        workspaceId,
      });

      if (!activityType) {
        return NextResponse.json(
          {
            code: "NOT_FOUND",
            message: "Activity type not found",
          },
          { status: 404 },
        );
      }

      activityTypeId = activityType?.id;
    }

    const values = Object.entries(rest)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(", ");

    const updateQuery = [
      values,
      activityTypeId ? `activityTypeId = '${activityTypeId}'` : "",
      "updatedAt = now()",
    ]
      .filter(Boolean)
      .join(", ");

    await client.query({
      query: `
          ALTER TABLE activity
          UPDATE
            ${updateQuery}
          WHERE id = '${id}'
          AND workspaceId = '${workspaceId}'
      `,
    });

    const result = await client.query({
      query: `
        SELECT * 
        FROM activity
        WHERE id = '${id}'
        AND workspaceId = '${workspaceId}'
      `,
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
