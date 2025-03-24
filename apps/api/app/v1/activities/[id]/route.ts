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

    return next({ ctx: { workspace_id: result.workspace_id } });
  })
  .params(paramsSchema)
  .handler(async (_, { ctx, params }) => {
    const { workspace_id } = ctx;
    const { id } = params;

    const result = await client.query({
      query: `
        SELECT * 
        FROM activity
        WHERE id = '${id}'
        AND workspace_id = '${workspace_id}'
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

    return next({ ctx: { workspace_id: result.workspace_id } });
  })
  .body(
    z.object({
      id: z.string(),
      activity_key: z.string().optional(),
      ...ActivitySchema.omit({ id: true }).partial().shape,
    }),
  )
  .handler(async (_, { ctx, params, body }) => {
    const { workspace_id } = ctx;
    const { id } = params;
    const { activity_key, ...rest } = body;

    let activity_type_id = null;

    if (activity_key) {
      const activity_type = await getActivityTypeByKey({
        key: activity_key,
        workspace_id,
      });
      activity_type_id = activity_type?.id;
    }

    const values = Object.entries(rest)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(", ");

    await client.query({
      query: `
        ALTER TABLE activity
        UPDATE 
          ${values}, 
          ${activity_type_id ? `activity_type_id = '${activity_type_id}',` : ""}
          updated_at = now()
        WHERE id = '${id}' 
        AND workspace_id = '${workspace_id}'
      `,
      format: "JSON",
    });

    const result = await client.query({
      query: `
        SELECT * 
        FROM activity
        WHERE id = '${id}'
        AND workspace_id = '${workspace_id}'
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

    return next({ ctx: { workspace_id: result.workspace_id } });
  })
  .params(paramsSchema)
  .handler(async (_, { ctx, params }) => {
    const { workspace_id } = ctx;
    const { id } = params;

    await client.query({
      query: `
        ALTER TABLE activity
        DELETE
        WHERE id = '${id}'
        AND workspace_id = '${workspace_id}'
      `,
      format: "JSON",
    });

    return NextResponse.json({ success: true });
  });
