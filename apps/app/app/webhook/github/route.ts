import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { deleteActivity } from "@conquest/clickhouse/activities/deleteActivity";
import { getActivity } from "@conquest/clickhouse/activities/getActivity";
import { updateActivity } from "@conquest/clickhouse/activities/updateActivity";
import { createGithubMember } from "@conquest/clickhouse/github/createGithubMember";
import { prisma } from "@conquest/db/prisma";
import { decrypt } from "@conquest/db/utils/decrypt";
import { env } from "@conquest/env";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import {
  IssuesEvent,
  PullRequestEvent,
  Repository,
  StarEvent,
  WebhookEvent,
} from "@octokit/webhooks-types";
import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { Octokit } from "octokit";

export async function POST(request: NextRequest) {
  const bodyRaw = await request.text();
  const headers = request.headers;
  const body = JSON.parse(bodyRaw) as WebhookEvent;

  const github = await checkSignature(request, bodyRaw);
  if (!github) return NextResponse.json({ status: 200 });

  const { details, workspace_id } = github;
  const { access_token, iv, repo } = details;

  const type = headers.get("x-github-event");

  const decryptedToken = await decrypt({ access_token, iv });
  const octokit = new Octokit({ auth: decryptedToken });

  switch (type) {
    case "star": {
      const event = body as StarEvent;
      const { sender, starred_at } = event;
      const { id } = sender;

      if (!starred_at) return NextResponse.json({ status: 200 });

      const { member_id } = await createGithubMember({
        octokit,
        id,
        created_at: new Date(starred_at),
        workspace_id,
      });

      await createActivity({
        activity_type_key: "github:star",
        message: `Starred the repository ${repo}`,
        member_id,
        created_at: new Date(starred_at),
        updated_at: new Date(starred_at),
        source: "Github",
        workspace_id,
      });

      break;
    }
    case "issues": {
      const event = body as IssuesEvent;
      const { action } = event;

      switch (action) {
        case "opened": {
          const { issue, sender } = event;
          const {
            number,
            title,
            body: message,
            created_at,
            updated_at,
          } = issue;
          const { id } = sender;

          const { member_id } = await createGithubMember({
            octokit,
            id,
            workspace_id,
          });

          await createActivity({
            external_id: String(number),
            activity_type_key: "github:issue",
            title: `#${number} - ${title}`,
            message: message ?? "",
            member_id,
            created_at: new Date(created_at),
            updated_at: new Date(updated_at),
            source: "Github",
            workspace_id,
          });

          break;
        }
        case "edited": {
          const { issue } = event;
          const { number, body, title } = issue;

          const activity = await getActivity({
            external_id: String(number),
            workspace_id,
          });

          if (!activity) return NextResponse.json({ status: 200 });

          const { activity_type, ...data } = activity;

          await updateActivity({
            ...data,
            title: `#${number} - ${title}`,
            message: body ?? "",
          });

          break;
        }
        case "deleted": {
          const { issue } = event;
          const { number } = issue;

          await deleteActivity({
            external_id: String(number),
            workspace_id,
          });
        }
      }

      break;
    }
    case "pull_request": {
      const event = body as PullRequestEvent;
      const { action } = event;

      break;
    }
  }

  return NextResponse.json({ message: "Webhook received" });
}

const checkSignature = async (request: NextRequest, bodyRaw: string) => {
  const event = JSON.parse(bodyRaw) as WebhookEvent;

  if ("repository" in event) {
    const repository = event.repository as Repository;
    const { name } = repository;

    const signature = request.headers.get("x-hub-signature-256");
    if (!signature) return false;

    const secret = env.GITHUB_WEBHOOK_SECRET;

    const expectedSignature = createHmac("sha256", secret)
      .update(bodyRaw)
      .digest("hex");
    if (signature !== `sha256=${expectedSignature}`) {
      return false;
    }

    if (!name) return false;

    const integration = await prisma.integration.findFirst({
      where: {
        details: {
          path: ["repo"],
          equals: name,
        },
      },
    });

    return GithubIntegrationSchema.parse(integration);
  }
};
