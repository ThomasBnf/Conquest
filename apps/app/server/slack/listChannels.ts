import { WebClient } from "@slack/web-api";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listChannels = protectedProcedure
  .input(
    z.object({
      accessToken: z.string().optional(),
    }),
  )
  .query(async ({ input }) => {
    const { accessToken } = input;

    const web = new WebClient(accessToken);

    const { channels } = await web.conversations.list({
      types: "public_channel",
      exclude_archived: true,
    });

    return channels;
  });
