import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { deleteActivity } from "@conquest/clickhouse/activities/deleteActivity";
import { getActivity } from "@conquest/clickhouse/activities/getActivity";
import { updateActivity } from "@conquest/clickhouse/activities/updateActivity";
import { prisma } from "@conquest/db/prisma";
import { decrypt } from "@conquest/db/utils/decrypt";
import { env } from "@conquest/env";
import { createGithubMember } from "@conquest/trigger/github/createGithubMember";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import {
  IssueCommentEvent,
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
  const type = headers.get("x-github-event");

  console.dir(body, { depth: null });

  const github = await checkSignature(request, bodyRaw);
  if (!github) return NextResponse.json({ status: 200 });

  const { details, workspaceId } = github;
  const { accessToken, iv, repo } = details;

  const decryptedToken = await decrypt({ accessToken, iv });
  const octokit = new Octokit({ auth: decryptedToken });

  try {
    switch (type) {
      case "star": {
        const event = body as StarEvent;
        const { sender, starred_at } = event;
        const { id } = sender;

        if (!starred_at) return NextResponse.json({ status: 200 });

        const { member } = await createGithubMember({
          octokit,
          id,
          createdAt: new Date(starred_at),
          workspaceId,
        });

        if (!member) return NextResponse.json({ status: 200 });

        await createActivity({
          activityTypeKey: "github:star",
          message: `Starred the repository ${repo}`,
          memberId: member.id,
          createdAt: new Date(starred_at),
          updatedAt: new Date(starred_at),
          source: "Github",
          workspaceId,
        });

        break;
      }
      case "issues": {
        const event = body as IssuesEvent;
        const { action, sender, issue } = event;
        const { number, title, body: message, created_at, updated_at } = issue;
        const { id } = sender;

        const { member } = await createGithubMember({
          octokit,
          id,
          workspaceId,
        });

        if (!member) return NextResponse.json({ status: 200 });

        switch (action) {
          case "opened": {
            await createActivity({
              externalId: String(number),
              activityTypeKey: "github:issue",
              title: `#${number} - ${title}`,
              message: message ?? "",
              memberId: member.id,
              createdAt: new Date(created_at),
              updatedAt: new Date(updated_at),
              source: "Github",
              workspaceId,
            });

            break;
          }
          case "edited": {
            const activity = await getActivity({
              externalId: String(number),
              workspaceId,
            });

            if (!activity) return NextResponse.json({ status: 200 });

            const { activityType, ...data } = activity;

            await updateActivity({
              ...data,
              title: `#${number} - ${title}`,
              message: message ?? "",
            });

            break;
          }
          case "deleted": {
            await deleteActivity({
              externalId: String(number),
              workspaceId,
            });
          }
        }

        break;
      }
      case "pull_request": {
        const event = body as PullRequestEvent;
        const { action, sender, pull_request } = event;
        const { number, title, body: message } = pull_request;
        const { id } = sender;

        const { member } = await createGithubMember({
          octokit,
          id,
          workspaceId,
        });

        if (!member) return NextResponse.json({ status: 200 });

        switch (action) {
          case "opened": {
            await createActivity({
              activityTypeKey: "github:pr",
              title: `#${number} - ${title}`,
              message: message ?? "",
              memberId: member.id,
              source: "Github",
              workspaceId,
            });

            break;
          }
          case "edited": {
            const activity = await getActivity({
              externalId: String(number),
              workspaceId,
            });

            if (!activity) return NextResponse.json({ status: 200 });

            const { activityType, ...data } = activity;

            await updateActivity({
              ...data,
              title: `#${number} - ${title}`,
              message: message ?? "",
            });

            break;
          }
        }

        break;
      }
      case "issue_comment": {
        const event = body as IssueCommentEvent;
        const { action, sender, issue, comment } = event;
        const { id: commentId, body: message } = comment;
        const { number } = issue;
        const { id } = sender;

        const { member } = await createGithubMember({
          octokit,
          id,
          workspaceId,
        });

        if (!member) return NextResponse.json({ status: 200 });

        switch (action) {
          case "created": {
            await createActivity({
              externalId: String(commentId),
              activityTypeKey: "github:comment",
              message,
              memberId: member.id,
              replyTo: String(number),
              source: "Github",
              workspaceId,
            });

            break;
          }
          case "edited": {
            const activity = await getActivity({
              externalId: String(commentId),
              workspaceId,
            });

            if (!activity) return NextResponse.json({ status: 200 });

            const { activityType, ...data } = activity;

            await updateActivity({
              ...data,
              message: message ?? "",
            });

            break;
          }
          case "deleted": {
            console.log("deleted", event);
            await deleteActivity({
              externalId: String(commentId),
              workspaceId,
            });
          }
        }

        break;
      }
    }
  } catch (error) {
    console.error("error", error);
    return NextResponse.json({ status: 200 });
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
      .update(Buffer.from(bodyRaw, "utf8"))
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

    if (!integration) return false;
    return GithubIntegrationSchema.parse(integration);
  }
};
