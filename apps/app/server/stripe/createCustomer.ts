import { stripe } from "@/lib/stripe";
import { resend } from "@conquest/db/resend";
import { updateWorkspace } from "@conquest/db/workspaces/updateWorkspace";
import { env } from "@conquest/env";
import { PLAN } from "@conquest/zod/enum/plan.enum";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const createCustomer = protectedProcedure
  .input(
    z.object({
      plan: PLAN,
      priceId: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { email, workspace } = user;
    const { plan, priceId } = input;
    const { id, name } = workspace;

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        workspace_id: id,
      },
    });

    if (!customer) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to stripe create customer",
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      metadata: {
        plan,
      },
      trial_settings: {
        end_behavior: {
          missing_payment_method: "cancel",
        },
      },
      ...(process.env.NODE_ENV === "production" && {
        promotion_code: "promo_1R7FrOCa7sC12ar1uAj264Th",
      }),
      trial_period_days: 14,
    });

    if (!subscription) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to stripe create subscription",
      });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${env.NEXT_PUBLIC_BASE_URL}/settings/billing`,
    });

    if (!portal) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to stripe create billing portal",
      });
    }

    await updateWorkspace({
      id,
      stripe_customer_id: customer.id,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    });

    await resend.emails.send({
      from: "Conquest <hello@useconquest.com>",
      to: "audrey@useconquest.com",
      subject: "New User Signup",
      html: `
        <p>Email: ${email}</p>
        <p>Workspace: ${workspace.name}</p>
        <p>Plan: ${plan}</p>
      `,
    });
  });
