import { stripe } from "@/lib/stripe";
import { updateWorkspace } from "@conquest/db/workspaces/updateWorkspace";
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
    const { workspaceId, email, firstName, lastName } = user;

    const customer = await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`,
      metadata: {
        workspaceId,
      },
    });

    if (!customer) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create Stripe customer",
      });
    }

    const workspace = await updateWorkspace({
      id: workspaceId,
      stripeCustomerId: customer.id,
    });

    const { trialEnd } = workspace;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      payment_method_types: ["card", "link"],
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_update: {
        address: "auto",
        name: "auto",
      },
      automatic_tax: {
        enabled: true,
      },
      metadata: {
        plan,
        priceId,
        workspaceId,
      },
      tax_id_collection: {
        enabled: true,
      },
      subscription_data: {
        trial_end: trialEnd ? Math.floor(trialEnd.getTime() / 1000) : undefined,
      },
      success_url: `${env.NEXT_PUBLIC_BASE_URL}/settings/billing`,
      cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/settings/billing`,
    });

    return session.url;
  });
