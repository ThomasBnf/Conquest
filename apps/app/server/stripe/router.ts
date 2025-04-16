import { router } from "@/server/trpc";
import { createBillingPortal } from "./createBillingPortal";
import { createCheckoutSession } from "./createCheckoutSession";
import { updateSubscription } from "./updateSubscription";

export const stripeRouter = router({
  createCheckoutSession,
  createBillingPortal,
  updateSubscription,
});
