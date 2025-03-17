import { stripe } from "@/lib/stripe";
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
    const { workspace } = user;
    const { stripe_customer_id } = workspace;

    if (!stripe_customer_id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Customer not found",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripe_customer_id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      payment_method_types: ["card", "link"],
      allow_promotion_codes: true,
      billing_address_collection: "required",
      customer_update: {
        address: "auto",
        name: "auto",
      },
      automatic_tax: {
        enabled: true,
      },
      metadata: {
        plan,
      },
      tax_id_collection: {
        enabled: true,
      },
      success_url: `${env.NEXT_PUBLIC_BASE_URL}/settings/billing`,
      cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/settings/billing`,
    });

    return session.url;
  });
