import { env } from "@conquest/env";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const createEvent = protectedProcedure
  .input(
    z.object({
      email: z.string(),
      event: z.string(),
      eventData: z.record(z.string(), z.string()),
    }),
  )
  .mutation(async ({ input }) => {
    const { email, event, eventData } = input;

    await fetch("https://in-automate.brevo.com/api/v2/trackEvent", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "ma-key": env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        event,
        eventData,
      }),
    });
  });
