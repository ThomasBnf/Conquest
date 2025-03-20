import { prisma } from "@conquest/db/prisma";
import { env } from "@conquest/env";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { StarEvent, WebhookEvent } from "@octokit/webhooks-types";
import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const headers = request.headers;

  const type = headers.get("x-github-event");

  const event = body as WebhookEvent;

  switch (type) {
    case "star": {
      const event = body as StarEvent;
    }
  }

  console.log(body);
  console.log(headers);

  return NextResponse.json({ message: "Webhook received" });
}

const checkSignature = async (request: NextRequest, rawBody: string) => {
  const signature = request.headers.get("x-discourse-event-signature");
  const community_url = request.headers.get("x-discourse-instance");

  if (!signature) return false;

  const secret = env.GITHUB_WEBHOOK_SECRET;

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
            path: ["repo"],
            equals: community_url,
          },
        },
      ],
    },
  });

  return GithubIntegrationSchema.parse(integration);
};
