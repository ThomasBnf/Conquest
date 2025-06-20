import { stripe } from "@/lib/stripe";
import { getWorkspace } from "@conquest/db/workspaces/getWorkspace";
import { env } from "@conquest/env";
import { PLAN } from "@conquest/zod/enum/plan.enum";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const createCheckoutSession = protectedProcedure
  .input(
    z.object({
      plan: PLAN,
      priceId: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input: { plan, priceId } }) => {
    const { workspaceId } = user;
    const { stripeCustomerId } = await getWorkspace({ id: workspaceId });

    if (!stripeCustomerId) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Stripe customer not found",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        plan,
        priceId,
        workspaceId,
      },
      billing_address_collection: "required",
      customer_update: {
        address: "auto",
        name: "auto",
      },
      automatic_tax: {
        enabled: true,
      },
      tax_id_collection: {
        enabled: true,
        required: "if_supported",
      },
      success_url: `${env.NEXT_PUBLIC_URL}/settings/billing`,
      cancel_url: `${env.NEXT_PUBLIC_URL}/settings/billing`,
    });

    return session.url;
  });
