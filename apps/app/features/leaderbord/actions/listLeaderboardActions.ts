"use server";

import { listLeaderboard } from "@/features/leaderbord/queries/listLeaderboard";
import { safeAction } from "@/lib/safeAction";
import { z } from "zod";

export const listLeaderboardActions = safeAction
  .metadata({
    name: "listLeaderboardActions",
  })
  .schema(
    z.object({
      page: z.number().default(0),
      from: z.date(),
      to: z.date(),
    }),
  )
  .action(async ({ parsedInput: { page, from, to } }) => {
    const rLeaderboard = await listLeaderboard({ page, from, to });
    return rLeaderboard?.data;
  });
