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
    const { id, stripeCustomerId } = workspace;

    if (!stripeCustomerId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Customer not found",
      });
    }
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
    });
    const currentSubscription = subscriptions.data[0];

    if (!currentSubscription) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Subscription not found",
      });
    }

    const subscriptionItemId = currentSubscription.items.data[0]?.id;
    const { trial_end } = currentSubscription;

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
      automatic_tax: {
        enabled: true,
      },
      trial_end: trial_end ?? undefined,
      metadata: {
        plan,
        priceId,
        workspaceId: id,
      },
    });
  });
