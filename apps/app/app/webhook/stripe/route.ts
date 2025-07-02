import { stripe } from "@/lib/stripe";
import { prisma } from "@conquest/db/prisma";
import { getWorkspaceByCustomerId } from "@conquest/db/workspaces/getWorkspaceByCustomerId";
import { updateWorkspace } from "@conquest/db/workspaces/updateWorkspace";
import { env } from "@conquest/env";
import { PLAN, Plan } from "@conquest/zod/enum/plan.enum";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import z from "zod";

const signingSecret = env.STRIPE_WEBHOOK_SECRET;

const MetadataSchema = z.object({
  plan: PLAN,
  priceId: z.string(),
  workspaceId: z.string(),
});

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
        console.log("<--- invoice --->");
        console.dir(invoice, { depth: null });

        const customer = invoice.customer as string;

        const workspace = await getWorkspaceByCustomerId({
          stripeCustomerId: customer,
        });

        if (!workspace) {
          console.log("Invoice.paid: Workspace not found");
          return NextResponse.json(
            { error: "Invoice.paid: Workspace not found" },
            { status: 400 },
          );
        }

        const priceId = invoice.lines.data[0]?.plan?.id as string;
        const productId = invoice.lines.data[0]?.plan?.product as string;
        const product = await stripe.products.retrieve(productId);
        const plan = product.name.toUpperCase() as Plan;

        await prisma.workspace.update({
          where: {
            id: workspace.id,
          },
          data: {
            plan,
            priceId,
            isPastDue: null,
            trialEnd: null,
          },
        });

        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("<--- session --->");
        console.dir(session, { depth: null });

        const customer = session.customer as string;

        const workspace = await getWorkspaceByCustomerId({
          stripeCustomerId: customer,
        });

        if (!workspace) {
          console.log("Checkout.session.completed: Workspace not found");
          return NextResponse.json(
            { error: "Checkout.session.completed: Workspace not found" },
            { status: 400 },
          );
        }

        const metadata = session.metadata;
        const { plan, priceId } = MetadataSchema.parse(metadata);

        await prisma.workspace.update({
          where: {
            id: workspace.id,
          },
          data: {
            plan,
            priceId,
            trialEnd: null,
            isPastDue: null,
          },
        });

        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("<--- subscription --->");
        console.dir(subscription, { depth: null });

        const customer = subscription.customer as string;

        const workspace = await getWorkspaceByCustomerId({
          stripeCustomerId: customer,
        });

        if (!workspace) {
          console.log("customer.subscription.updated: Workspace not found");
          return NextResponse.json(
            { error: "customer.subscription.updated: Workspace not found" },
            { status: 400 },
          );
        }

        const priceId = subscription.items.data[0]?.plan.id as string;
        const productId = subscription.items.data[0]?.plan.product as string;
        const product = await stripe.products.retrieve(productId);
        const plan = product.name.toUpperCase() as Plan;

        console.log("priceId", priceId);
        console.log("productId", productId);
        console.log("product", product);
        console.log("plan", plan);

        const { trialEnd } = workspace;
        const success = subscription.status === "active";
        const failed = [
          "incompleted",
          "incompleted_expired",
          "past_due",
          "canceled",
          "unpaid",
          "paused",
        ].includes(subscription.status);

        await prisma.workspace.update({
          where: {
            id: workspace.id,
          },
          data: {
            plan,
            priceId,
            isPastDue: failed ? new Date() : null,
            trialEnd: success ? null : trialEnd,
          },
        });

        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("<--- subscriptionDeleted --->");
        console.dir(subscription, { depth: null });

        const customer = subscription.customer as string;

        const workspace = await getWorkspaceByCustomerId({
          stripeCustomerId: customer,
        });

        if (!workspace) {
          console.log("Subscription.deleted: Workspace not found");
          return NextResponse.json(
            { error: "Subscription.deleted: Workspace not found" },
            { status: 400 },
          );
        }

        const isPastDue = [
          "incompleted",
          "incompleted_expired",
          "past_due",
          "canceled",
          "unpaid",
          "paused",
        ].includes(subscription.status);

        await updateWorkspace({
          id: workspace.id,
          priceId: isPastDue ? null : workspace.priceId,
          plan: isPastDue ? "TRIAL" : workspace.plan,
          isPastDue: isPastDue ? new Date() : workspace.isPastDue,
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
