import { stripe } from "@/lib/stripe";
import { prisma } from "@conquest/db/prisma";
import { getWorkspaceStripe } from "@conquest/db/workspaces/getWorkspaceStripe";
import { updateWorkspace } from "@conquest/db/workspaces/updateWorkspace";
import { env } from "@conquest/env";
import type { Plan } from "@conquest/zod/enum/plan.enum";
import { isBefore } from "date-fns";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

const signingSecret = env.STRIPE_WEBHOOK_SECRET;

export const POST = async (request: NextRequest) => {
  const text = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "stripe-signature is missing" },
      { status: 400 },
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      text,
      signature,
      signingSecret,
    );

    switch (event.type) {
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("invoice", invoice);

        const workspace = await getWorkspaceStripe({
          stripe_customer_id: invoice.customer as string,
        });

        if (!workspace) {
          return NextResponse.json({ error: "Workspace not found" });
        }

        const { plan, price_id } = invoice.subscription_details?.metadata as {
          price_id: string;
          plan: Plan;
        };

        await prisma.workspace.update({
          where: {
            id: workspace.id,
          },
          data: {
            plan,
            price_id,
            is_past_due: null,
          },
        });

        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("session", session);

        const workspace = await getWorkspaceStripe({
          stripe_customer_id: session.customer as string,
        });

        if (!workspace) {
          return NextResponse.json({ error: "Workspace not found" });
        }

        const { plan, price_id } = session.metadata as {
          plan: Plan;
          price_id: string;
        };

        const { trial_end } = workspace;

        const isTrialEnded = trial_end && isBefore(trial_end, new Date());

        await prisma.workspace.update({
          where: {
            id: workspace.id,
          },
          data: {
            plan,
            price_id,
            trial_end: isTrialEnded ? null : trial_end,
            is_past_due: null,
          },
        });

        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("subscription", subscription);

        const workspace = await getWorkspaceStripe({
          stripe_customer_id: subscription.customer as string,
        });

        if (!workspace) {
          return NextResponse.json({ error: "Workspace not found" });
        }

        const { plan, price_id } = subscription.metadata as {
          plan: Plan;
          price_id: string;
        };

        const { trial_end } = subscription;
        const hasTrial = trial_end !== null;
        const isTrialEnded = hasTrial && isBefore(trial_end, new Date());

        await prisma.workspace.update({
          where: {
            id: workspace.id,
          },
          data: {
            plan,
            price_id,
            trial_end: hasTrial
              ? isTrialEnded
                ? null
                : new Date(trial_end * 1000)
              : null,
            is_past_due:
              subscription.status === "paused" ||
              subscription.status === "past_due"
                ? new Date()
                : null,
          },
        });

        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("subscriptionDeleted", subscription);

        const workspace = await getWorkspaceStripe({
          stripe_customer_id: subscription.customer as string,
        });

        if (!workspace) {
          return NextResponse.json({ error: "Workspace not found" });
        }

        await updateWorkspace({
          id: workspace.id,
          is_past_due: new Date(),
        });

        break;
      }
    }

    return NextResponse.json({ status: 200 });
  } catch (err) {
    if (err instanceof Error) {
      console.error("Webhook error", err);

      return NextResponse.json(
        { error: `Webhook error: ${err.message}` },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: `Webhook error: ${err}` },
      { status: 500 },
    );
  }
};
