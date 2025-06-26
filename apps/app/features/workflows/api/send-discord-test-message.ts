import { protectedProcedure } from "@/server/trpc";
import { discordClient } from "@conquest/db/discord";
import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { getProfileBySource } from "@conquest/db/profile/getProfileBySource";
import { decrypt } from "@conquest/db/utils/decrypt";
import { plateToDiscordMarkdown } from "@conquest/utils/plateToDiscordMarkdown";
import { replaceVariables } from "@conquest/utils/replace-variables";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { MessageSchema } from "@conquest/zod/schemas/node.schema";
import { TRPCError } from "@trpc/server";
import { APIDMChannel, Routes } from "discord-api-types/v10";
import { z } from "zod";

export const sendDiscordTestMessage = protectedProcedure
  .input(
    z.object({
      member: MemberSchema,
      message: MessageSchema,
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { member, message } = input;
    const { workspaceId } = user;

    const discord = await getIntegrationBySource({
      source: "Discord",
      workspaceId,
    });

    if (!discord) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Discord integration not configured for this workspace",
      });
    }

    const { details } = DiscordIntegrationSchema.parse(discord);
    const { accessToken, accessTokenIv } = details;

    const decryptedUserToken = await decrypt({
      accessToken,
      iv: accessTokenIv,
    });

    if (!decryptedUserToken) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to decrypt Discord access token",
      });
    }

    const profile = await getProfileBySource({
      memberId: member.id,
      source: "Discord",
      workspaceId,
    });

    if (!profile?.externalId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Member has no associated Discord account",
      });
    }

    const channel = (await discordClient.post(Routes.userChannels(), {
      body: {
        recipient_id: profile.externalId,
      },
    })) as APIDMChannel;

    if (!channel?.id) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to open Discord conversation with user",
      });
    }

    const markdown = plateToDiscordMarkdown(message);

    const parsedMessage = await replaceVariables({
      message: markdown,
      member,
      source: "Discord",
    });

    await discordClient.post(Routes.channelMessages(channel.id), {
      body: {
        content: parsedMessage,
      },
    });

    return { success: true };
  });
