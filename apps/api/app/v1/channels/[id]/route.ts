import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
import { sleep } from "@/utils/sleep";
import { deleteChannel } from "@conquest/clickhouse/channels/deleteChannel";
import { getChannel } from "@conquest/clickhouse/channels/getChannel";
import { updateChannel } from "@conquest/clickhouse/channels/updateChannel";
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

    const channel = await getChannel({ id });

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
    z.object({
      externalId: z.string().min(1).optional(),
      name: z.string().min(1).optional(),
    }),
  )
  .handler(async (_, { params, body }) => {
    const { id } = params;
    const { externalId, name } = body;

    const channel = await getChannel({ id });

    if (!channel) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Channel not found" },
        { status: 404 },
      );
    }

    await updateChannel({ id, externalId, name });

    await sleep(50);

    const updatedChannel = await getChannel({ id });

    return NextResponse.json({ channel: updatedChannel });
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

    const channel = await getChannel({ id });

    if (!channel) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Channel not found" },
        { status: 404 },
      );
    }

    await deleteChannel({ id });

    return NextResponse.json({ success: true });
  });
