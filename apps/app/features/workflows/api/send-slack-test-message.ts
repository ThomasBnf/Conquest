import { protectedProcedure } from "@/server/trpc";
import { getProfileBySource } from "@conquest/clickhouse/profile/getProfileBySource";
import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { decrypt } from "@conquest/db/utils/decrypt";
import { plateToSlackMarkdown } from "@conquest/utils/plateToSlackMarkdown";
import { replaceVariables } from "@conquest/utils/replace-variables";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { MessageSchema } from "@conquest/zod/schemas/node.schema";
import { WebClient } from "@slack/web-api";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const sendSlackTestMessage = protectedProcedure
  .input(
    z.object({
      member: MemberSchema,
      message: MessageSchema,
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { member, message } = input;
    const { workspaceId } = user;

    const slack = await getIntegrationBySource({
      source: "Slack",
      workspaceId,
    });

    if (!slack) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Slack integration not configured for this workspace",
      });
    }

    const { details } = SlackIntegrationSchema.parse(slack);
    const { userToken, userTokenIv } = details;

    const decryptedUserToken = await decrypt({
      accessToken: userToken,
      iv: userTokenIv,
    });

    if (!decryptedUserToken) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to decrypt Slack user token",
      });
    }

    const web = new WebClient(decryptedUserToken);

    const profile = await getProfileBySource({
      source: "Slack",
      memberId: member.id,
    });

    if (!profile?.externalId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Member has no associated Slack account",
      });
    }

    const { channel } = await web.conversations.open({
      users: profile.externalId,
    });

    if (!channel?.id) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to open Slack conversation with user",
      });
    }

    const markdown = plateToSlackMarkdown(message);

    console.log(markdown);

    const parsedMessage = await replaceVariables({
      message: markdown,
      member,
      source: "Slack",
    });

    await web.chat.postMessage({
      channel: channel.id,
      text: parsedMessage,
      as_user: true,
    });

    return { success: true };
  });
