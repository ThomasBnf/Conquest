import { createHmac } from "node:crypto";
import { env } from "@conquest/env";
import { DiscourseIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import type { Context } from "hono";
import { prisma } from "../../prisma";

type Props = {
  c: Context;
};

export const checkSignature = async ({ c }: Props) => {
  const signature = c.req.header("X-Discourse-Event-Signature");
  const community_url = c.req.header("X-Discourse-Instance");
  const rawBody = await c.req.text();

  if (!signature) return false;

  const secret = env.DISCOURSE_SECRET_KEY!;

  const expectedSignature = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (signature !== `sha256=${expectedSignature}`) {
    return false;
  }

  const integration = await prisma.integrations.findFirst({
    where: {
      details: {
        path: ["community_url"],
        equals: community_url,
      },
      status: "CONNECTED",
    },
  });

  if (!integration) return false;

  return DiscourseIntegrationSchema.parse(integration);
};
