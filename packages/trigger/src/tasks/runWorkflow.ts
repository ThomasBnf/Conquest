import { getProfileBySource } from "@conquest/clickhouse/profiles/getProfileBySource";
import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { decrypt } from "@conquest/db/utils/decrypt";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { Member, MemberSchema } from "@conquest/zod/schemas/member.schema";
import {
  NodeSchema,
  NodeSlackMessage,
  NodeWebhook,
} from "@conquest/zod/schemas/node.schema";
import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";
import { WebClient } from "@slack/web-api";
import { logger, schemaTask, wait } from "@trigger.dev/sdk/v3";
import { z } from "zod";

let currentMember: Member;

export const runWorkflow = schemaTask({
  id: "run-workflow",
  machine: "small-2x",
  schema: z.object({
    workflow: WorkflowSchema,
    member: MemberSchema,
  }),
  run: async ({ workflow, member }) => {
    currentMember = member;

    const { nodes, edges, workspaceId } = workflow;

    let node = nodes.find((node) => "isTrigger" in node.data);
    let hasNextNode = true;

    while (hasNextNode) {
      const parsedNode = NodeSchema.parse(node);
      const { type } = parsedNode.data;

      switch (type) {
        case "slack-message": {
          await slackMessage({ node: parsedNode.data, workspaceId });
          break;
        }
        case "wait": {
          const { duration, unit } = parsedNode.data;

          const timeMap = {
            seconds: 1,
            minutes: 60,
            hours: 60 * 60,
            days: 24 * 60 * 60,
          } as const;

          const milliseconds = duration * timeMap[unit];
          await wait.for({ seconds: milliseconds });
          break;
        }
        case "webhook": {
          await webhook({ node: parsedNode.data });
          break;
        }
      }

      const edge = edges.find((edge) => edge.source === node?.id);

      if (!edge) {
        hasNextNode = false;
      } else {
        node = nodes.find((currentNode) => edge?.target === currentNode.id);
      }
    }
  },
});

export const slackMessage = async ({
  node,
  workspaceId,
}: {
  node: NodeSlackMessage;
  workspaceId: string;
}) => {
  const slack = await getIntegrationBySource({ source: "Slack", workspaceId });

  if (!slack) return logger.error("No Slack integration found");

  const { details } = SlackIntegrationSchema.parse(slack);
  const { userToken, userTokenIv } = details;
  const { message } = node;

  const decryptedUserToken = await decrypt({
    accessToken: userToken,
    iv: userTokenIv,
  });

  if (!userToken) logger.error("No Slack user token found");

  const web = new WebClient(decryptedUserToken);

  const profile = await getProfileBySource({
    source: "Slack",
    memberId: currentMember.id,
  });

  if (!profile?.externalId) return logger.error("No Slack profile found");

  const { channel } = await web.conversations.open({
    users: profile.externalId,
  });

  if (!channel?.id) return logger.error("No channel ID found");

  const parsedMessage = replaceMemberVariables(message);

  await web.chat.postMessage({
    channel: channel?.id,
    text: parsedMessage,
    as_user: true,
  });
};

export const webhook = async ({ node }: { node: NodeWebhook }) => {
  const { url, body } = node;

  if (!url) throw new Error("No URL provided");

  const parsedBody = replaceMemberVariables(body);

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: parsedBody,
  });
};

const replaceMemberVariables = (message: string | undefined) => {
  if (!message) return "";

  if (message.includes("{{createdMember}}")) {
    return message.replaceAll(
      "{{createdMember}}",
      JSON.stringify(currentMember, null, 2),
    );
  }

  const variables = {
    "{{firstName}}": currentMember.firstName,
    "{{lastName}}": currentMember.lastName,
    "{{primaryEmail}}": currentMember.primaryEmail,
    "{{country}}": currentMember.country,
    "{{language}}": currentMember.language,
    "{{jobTitle}}": currentMember.jobTitle,
    "{{linkedinUrl}}": currentMember.linkedinUrl,
    "{{emails}}": currentMember.emails.join(", "),
    "{{phones}}": currentMember.phones.join(", "),
  };

  return Object.entries(variables).reduce(
    (acc, [key, value]) => acc.replaceAll(key, value),
    message,
  );
};
