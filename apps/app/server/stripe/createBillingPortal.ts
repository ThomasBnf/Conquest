import { stripe } from "@/lib/stripe";
import { env } from "@conquest/env";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const createBillingPortal = protectedProcedure
  .input(
    z.object({
      payment_method_update: z.boolean().optional(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace } = user;
    const { stripe_customer_id } = workspace;
    const { payment_method_update } = input;

    if (!stripe_customer_id) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Stripe customer ID not found",
      });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: stripe_customer_id,
      return_url: `${env.NEXT_PUBLIC_BASE_URL}/settings/billing`,
      ...(payment_method_update && {
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
