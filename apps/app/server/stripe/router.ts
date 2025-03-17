import { router } from "@/server/trpc";
import { createBillingPortal } from "./createBillingPortal";
import { createCheckoutSession } from "./createCheckoutSession";
import { createCustomer } from "./createCustomer";
import { updateSubscription } from "./updateSubscription";

export const stripeRouter = router({
  createCustomer,
  createCheckoutSession,
  createBillingPortal,
  updateSubscription,
});
