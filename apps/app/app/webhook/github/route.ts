import { StarEvent, WebhookEvent } from "@octokit/webhooks-types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const headers = request.headers;

  const integration = await checkSignature(request, body);

  // if (!integration) return NextResponse.json({ status: 200 });

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

const checkSignature = async (request: NextRequest, body: WebhookEvent) => {
  // const name = body.na
  // const signature = request.headers.get("x-hub-signature-256");
  // if (!signature) return false;
  // const secret = env.GITHUB_WEBHOOK_SECRET;
  // const expectedSignature = createHmac("sha256", secret)
  //   .update(body)
  //   .digest("hex");
  // if (signature !== `sha256=${expectedSignature}`) {
  //   return false;
  // }
  // if (!name) return false;
  // const integration = await prisma.integration.findFirst({
  //   where: {
  //     details: {
  //       path: ["source"],
  //       equals: "Discourse",
  //     },
  //     AND: [
  //       {
  //         details: {
  //           path: ["repo"],
  //           equals: name,
  //         },
  //       },
  //     ],
  //   },
  // });
  // return GithubIntegrationSchema.parse(integration);
};
