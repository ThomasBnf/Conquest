import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
import { getActivityTypeByKey } from "@conquest/clickhouse/activity-type/getActivityTypeByKey";
import { deleteActivity } from "@conquest/clickhouse/activity/deleteActivity";
import { getActivity } from "@conquest/clickhouse/activity/getActivity";
import { client } from "@conquest/clickhouse/client";
import { sleep } from "@conquest/utils/sleep";
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
  .handler(async (_, { params }) => {
    const { id } = params;

    const activity = await getActivity({ id });

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
  .params(paramsSchema)
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

    const activity = await getActivity({ id, workspaceId });

    if (!activity) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Activity not found" },
        { status: 404 },
      );
    }

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

    await sleep(50);

    const updatedActivity = await getActivity({ id, workspaceId });

    return NextResponse.json({ activity: updatedActivity });
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
  .handler(async (_, { params }) => {
    const { id } = params;

    const activity = await getActivity({ id });

    if (!activity) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Activity not found" },
        { status: 404 },
      );
    }

    await deleteActivity({ id });

    return NextResponse.json({ success: true });
  });
