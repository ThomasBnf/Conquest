import { stripe } from "@/lib/stripe";
import { prisma } from "@conquest/db/prisma";
import { getWorkspace } from "@conquest/db/workspaces/getWorkspace";
import { updateWorkspace } from "@conquest/db/workspaces/updateWorkspace";
import { env } from "@conquest/env";
import { PLAN } from "@conquest/zod/enum/plan.enum";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { z } from "zod";

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
        console.log("invoice", invoice);

        const metadata = invoice.subscription_details?.metadata;
        const parsedMetadata = MetadataSchema.safeParse(metadata);

        if (parsedMetadata.error) {
          return NextResponse.json(
            { error: "Subscription.updated: Invalid metadata" },
            { status: 400 },
          );
        }

        const { plan, priceId, workspaceId } = parsedMetadata.data;

        const workspace = await getWorkspace({ id: workspaceId });

        if (!workspace) {
          return NextResponse.json(
            { error: "Invoice.paid: Workspace not found" },
            { status: 400 },
          );
        }

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
        console.log("session", session);

        const metadata = session.metadata;
        const parsedMetadata = MetadataSchema.safeParse(metadata);

        if (parsedMetadata.error) {
          return NextResponse.json(
            { error: "Checkout.session.completed: Invalid metadata" },
            { status: 400 },
          );
        }

        const { plan, priceId, workspaceId } = parsedMetadata.data;

        const workspace = await getWorkspace({ id: workspaceId });

        if (!workspace) {
          return NextResponse.json(
            { error: "Checkout.session.completed: Workspace not found" },
            { status: 400 },
          );
        }

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
        console.log("subscription", subscription);

        const metadata = subscription.metadata;
        const parsedMetadata = MetadataSchema.safeParse(metadata);

        if (parsedMetadata.error) {
          return NextResponse.json(
            { error: "Subscription.updated: Invalid metadata" },
            { status: 400 },
          );
        }

        const { plan, priceId, workspaceId } = parsedMetadata.data;

        const workspace = await getWorkspace({ id: workspaceId });

        if (!workspace) {
          return NextResponse.json(
            { error: "Subscription.updated: Workspace not found" },
            { status: 400 },
          );
        }

        const failed = ["past_due", "canceled", "unpaid"].includes(
          subscription.status,
        );
        const success = ["active"].includes(subscription.status);

        const { trialEnd } = await getWorkspace({ id: workspaceId });

        await prisma.workspace.update({
          where: {
            id: workspaceId,
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
        console.log("subscriptionDeleted", subscription);

        const metadata = subscription.metadata;
        const parsedMetadata = MetadataSchema.safeParse(metadata);

        if (parsedMetadata.error) {
          return NextResponse.json(
            { error: "Subscription.deleted: Invalid metadata" },
            { status: 400 },
          );
        }

        const { workspaceId } = parsedMetadata.data;

        const workspace = await getWorkspace({ id: workspaceId });

        if (!workspace) {
          return NextResponse.json(
            { error: "Subscription.deleted: Workspace not found" },
            { status: 400 },
          );
        }

        await updateWorkspace({
          id: workspaceId,
          isPastDue: new Date(),
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
