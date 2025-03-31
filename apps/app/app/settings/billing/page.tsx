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
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { data: session, update } = useSession();
  const { workspace } = session?.user ?? {};
  const { trial_end, price_id } = workspace ?? {};

  const subscription = getSubscriptionDetails(price_id);
  const isTrial = trial_end && trial_end < new Date();

  const [period, setPeriod] = useState<PlanPeriod>(
    subscription?.period ?? "annually",
  );
  const [loading, setLoading] = useState(false);

  const { mutateAsync } = trpc.stripe.updateSubscription.useMutation({
    onSuccess: () => {
      setTimeout(() => {
        update();
        setLoading(false);
        toast.success(
          isTrial ? "Your trial plan has been updated" : "Subscription updated",
          { duration: 5000 },
        );
      }, 3000);
    },
    onError: (error) => {
      toast.error(error.message);
      setLoading(false);
    },
  });

  const onSelectPlan = async ({
    plan,
    priceId,
  }: {
    plan: Plan;
    priceId: string;
  }) => {
    setLoading(true);
    await mutateAsync({ plan, priceId });
  };

  return (
    <BillingPage
      title="Billing"
      description="Update your payment information or switch plans according to your needs"
      displayTrial={false}
    >
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
