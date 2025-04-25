"use client";

import { BillingPage } from "@/features/billing/billing-page";
import { ButtonBillingPortal } from "@/features/billing/button-billing-portal";
import { PlanPicker } from "@/features/billing/plan-picker";
import { PlansTable } from "@/features/billing/plans-table";
import type { PlanPeriod } from "@/features/billing/types";
import { trpc } from "@/server/client";
import { getSubscriptionDetails } from "@/utils/getSubscriptionDetails";
import { Separator } from "@conquest/ui/separator";
import type { Plan } from "@conquest/zod/enum/plan.enum";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { data: session, update } = useSession();
  const { workspace } = session?.user ?? {};
  const { stripeCustomerId, priceId } = workspace ?? {};
  const router = useRouter();

  const subscription = getSubscriptionDetails(priceId);

  const [period, setPeriod] = useState<PlanPeriod>(
    subscription?.period ?? "annually",
  );
  const [loading, setLoading] = useState(false);

  const { mutateAsync } = trpc.stripe.createCheckoutSession.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (url) => {
      if (!url) return;
      router.push(url);
      update();
    },
    onError: (error) => {
      toast.error(error.message);
      setLoading(false);
    },
  });

  const { mutateAsync: updateSubscription } =
    trpc.stripe.updateSubscription.useMutation({
      onMutate: () => {
        setLoading(true);
      },
      onSuccess: () => {
        update();
        toast.success("Subscription updated");
      },
      onError: (error) => {
        setLoading(false);
        toast.error(error.message);
      },
    });

  const onSelectPlan = async ({
    plan,
    priceId,
  }: {
    plan: Plan;
    priceId: string;
  }) => {
    if (stripeCustomerId) {
      await updateSubscription({ plan, priceId });
    } else {
      await mutateAsync({ plan, priceId });
    }
  };

  return (
    <BillingPage
      title="Billing"
      description="Update your payment information or switch plans according to your needs"
      displayTrial={false}
    >
      {stripeCustomerId && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-12">
            <div>
              <p className="font-medium text-lg">Manage your subscription</p>
              <p className="text-muted-foreground">
                Get your invoices, payment history, or cancel your subscription.
              </p>
            </div>
            <ButtonBillingPortal />
          </div>
          <Separator className="my-4" />
        </>
      )}
      <PlanPicker
        period={period}
        setPeriod={setPeriod}
        loading={loading}
        onSelectPlan={onSelectPlan}
        workspace={workspace}
      />
      <PlansTable period={period} setPeriod={setPeriod} />
    </BillingPage>
  );
}
