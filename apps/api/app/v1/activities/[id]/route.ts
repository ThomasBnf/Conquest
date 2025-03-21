import { V1UpdateActivitySchema } from "@/schemas/activity.schema";
import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
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
  .handler(async (_, { params }) => {
    const { id } = params;

    const result = await client.query({
      query: `
        SELECT * 
        FROM activity
        WHERE id = '${id}'
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
  .body(V1UpdateActivitySchema)
  .handler(async (_, { params, body }) => {
    const { id } = params;

    const values = Object.entries(body)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(", ");

    await client.query({
      query: `
        ALTER TABLE activity
        UPDATE 
          ${values}, 
          updated_at = now()
        WHERE id = '${id}' 
      `,
      format: "JSON",
    });

    const result = await client.query({
      query: `
        SELECT * 
        FROM activity
        WHERE id = '${id}'
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
  .handler(async (_, { params }) => {
    const { id } = params;

    const result = await client.query({
      query: `
        ALTER TABLE activity
        DELETE
        WHERE id = '${id}'
      `,
      format: "JSON",
    });

    return NextResponse.json({ success: true });
  });
