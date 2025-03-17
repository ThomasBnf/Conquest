import { stripe } from "@/lib/stripe";
import { PLAN } from "@conquest/zod/enum/plan.enum";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateSubscription = protectedProcedure
  .input(
    z.object({
      plan: PLAN,
      priceId: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace } = user;
    const { plan, priceId } = input;
    const { id, stripe_customer_id } = workspace;

    if (!stripe_customer_id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Customer not found",
      });
    }
    const subscriptions = await stripe.subscriptions.list({
      customer: stripe_customer_id,
    });
    const currentSubscription = subscriptions.data[0];

    if (!currentSubscription) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Subscription not found",
      });
    }

    const subscriptionItemId = currentSubscription.items.data[0]?.id;

    if (!subscriptionItemId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Subscription item not found",
      });
    }

    await stripe.subscriptions.update(currentSubscription.id, {
      items: [
        {
          id: subscriptionItemId,
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        plan,
        workspace_id: id,
      },
    });
  });
