import { prisma } from "@/lib/prisma";
import { DiscourseIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import type { Context } from "hono";
import { createHmac } from "node:crypto";

type Props = {
  c: Context;
};

export const checkSignature = async ({ c }: Props) => {
  const signature = c.req.header("X-Discourse-Event-Signature");
  const community_url = c.req.header("X-Discourse-Instance");
  const rawBody = await c.req.text();

  if (!signature) return false;

  const secret =
    "a7e80919eecc82b71fe8a23d8d0e199bf3d593216835315133254de014e9e1b3";

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
    },
  });

  if (!integration) return false;

  return DiscourseIntegrationSchema.parse(integration);
};
