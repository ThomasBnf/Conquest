import { prisma } from "@/lib/prisma";
import { safeRoute } from "@/lib/safeRoute";
import { NextResponse } from "next/server";
import crypto from "node:crypto";

const DISCOURSE_WEBHOOK_SECRET = "9567a3dc9def";

export const POST = safeRoute.handler(async (request, context) => {
  if (!isValid(request, context)) return NextResponse.json({ status: 401 });
  const body = context.body;

  switch (body) {
    case "category": {
      const channel = await prisma.channels.upsert({
        where: {
          external_id: body.id,
        },
        update: {
          name: body.name,
        },
        create: {
          external_id: body.id,
          name: body.name,
          source: "DISCOURSE",
          workspace_id: body.workspace_id,
        },
      });
      break;
    }
  }

  return NextResponse.json({ success: true });
});

const isValid = (request: Request, context: { body: unknown }) => {
  const signature = request.headers.get("x-discourse-event-signature");

  if (!signature) return false;

  const body = context.body;

  const computedSignature = crypto
    .createHmac("sha256", DISCOURSE_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest("hex");

  return `sha256=${computedSignature}` === signature;
};
