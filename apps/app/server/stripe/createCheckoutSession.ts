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
    const { workspace_id, email, first_name, last_name } = user;

    const customer = await stripe.customers.create({
      email,
      name: `${first_name} ${last_name}`,
      metadata: {
        workspace_id,
      },
    });

    if (!customer) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create Stripe customer",
      });
    }

    const workspace = await updateWorkspace({
      id: workspace_id,
      stripe_customer_id: customer.id,
    });

    const { trial_end } = workspace;

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
        price_id: priceId,
        workspace_id,
      },
      tax_id_collection: {
        enabled: true,
      },
      subscription_data: {
        trial_end: trial_end
          ? Math.floor(trial_end.getTime() / 1000)
          : undefined,
      },
      success_url: `${env.NEXT_PUBLIC_BASE_URL}/settings/billing`,
      cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/settings/billing`,
    });

    return session.url;
  });
