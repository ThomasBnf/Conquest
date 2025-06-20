import { stripe } from "@/lib/stripe";
import { getWorkspace } from "@conquest/db/workspaces/getWorkspace";
import { env } from "@conquest/env";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const createBillingPortal = protectedProcedure
  .input(
    z.object({
      paymentMethodUpdate: z.boolean().optional(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { stripeCustomerId } = await getWorkspace({ id: workspaceId });
    const { paymentMethodUpdate } = input;

    if (!stripeCustomerId) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Stripe customer ID not found",
      });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_URL}/settings/billing`,
      ...(paymentMethodUpdate && {
        flow_data: { type: "payment_method_update" },
      }),
    });

    if (!portal) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create billing portal",
      });
    }

    return portal.url;
  });
