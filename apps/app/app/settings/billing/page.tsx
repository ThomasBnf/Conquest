"use client";

import { BillingPage } from "@/features/billing/billing-page";
import { PlanPicker } from "@/features/billing/plan-picker";
import { PlansTable } from "@/features/billing/plans-table";
import type { PlanPeriod } from "@/features/billing/types";
import { trpc } from "@/server/client";
import { getSubscriptionDetails } from "@/utils/getSubscriptionDetails";
import type { Plan } from "@conquest/zod/enum/plan.enum";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { data: workspace } = trpc.workspaces.get.useQuery();
  const { plan: currentPlan, priceId } = workspace ?? {};

  const [period, setPeriod] = useState<PlanPeriod>("annually");
  const [loading, setLoading] = useState(false);

  const subscription = getSubscriptionDetails(priceId);
  const router = useRouter();

  const { mutateAsync } = trpc.stripe.createCheckoutSession.useMutation({
    onMutate: () => setLoading(true),
    onSuccess: (url) => {
      if (!url) return;
      router.push(url);
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  const { mutateAsync: updateSubscription } =
    trpc.stripe.updateSubscription.useMutation({
      onMutate: () => setLoading(true),
      onSuccess: () => toast.success("Subscription updated"),
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
    if (currentPlan === "TRIAL") {
      await mutateAsync({ plan, priceId });
    } else {
      await updateSubscription({ plan, priceId });
    }
  };

  useEffect(() => {
    if (subscription) setPeriod(subscription.period);
  }, [subscription]);

  return (
    <BillingPage
      title="Billing"
      description="Update your payment information or switch plans according to your needs"
      displayTrial={false}
    >
      <PlanPicker
        period={period}
        setPeriod={setPeriod}
        loading={loading}
        onSelectPlan={onSelectPlan}
      />
      <PlansTable period={period} setPeriod={setPeriod} />
    </BillingPage>
  );
}
