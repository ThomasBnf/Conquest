import { env } from "@conquest/env";
import { DiscourseIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import type { NextRequest } from "next/server";
import { createHmac } from "node:crypto";
import { prisma } from "../prisma";

type Props = {
  request: NextRequest;
};

export const checkSignature = async ({ request }: Props) => {
  const signature = request.headers.get("X-Discourse-Event-Signature");
  const community_url = request.headers.get("X-Discourse-Instance");
  const rawBody = await request.text();

  if (!signature) return false;

  const secret = env.DISCOURSE_SECRET_KEY;

  const expectedSignature = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (signature !== `sha256=${expectedSignature}`) {
    return false;
  }

  if (!community_url) return false;

  const integration = await prisma.integration.findFirst({
    where: {
      details: {
        path: ["source"],
        equals: "Discourse",
      },
      AND: [
        {
          details: {
            path: ["community_url"],
            equals: community_url,
          },
        },
      ],
    },
  });

  return DiscourseIntegrationSchema.parse(integration);
};
