import { protectedProcedure } from "@/server/trpc";
import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { getProfileBySource } from "@conquest/db/profile/getProfileBySource";
import { decrypt } from "@conquest/db/utils/decrypt";
import { replaceVariables } from "@conquest/utils/replace-variables";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { WebClient } from "@slack/web-api";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const sendSlackTestMessage = protectedProcedure
  .input(
    z.object({
      member: MemberSchema,
      message: z.string(),
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
      memberId: member.id,
      source: "Slack",
      workspaceId,
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

    const parsedMessage = await replaceVariables({
      message,
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
