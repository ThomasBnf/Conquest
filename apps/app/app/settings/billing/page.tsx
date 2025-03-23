"use client";

import { BillingPage } from "@/features/billing/billing-page";
import { ButtonBillingPortal } from "@/features/billing/button-billing-portal";
import { PlanPicker } from "@/features/billing/plan-picker";
import { PlansTable } from "@/features/billing/plans-table";
import type { PlanPeriod } from "@/features/billing/types";
import { trpc } from "@/server/client";
import { Separator } from "@conquest/ui/separator";
import type { Plan } from "@conquest/zod/enum/plan.enum";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [period, setPeriod] = useState<PlanPeriod>("monthly");
  const [loading, setLoading] = useState<Plan | null>(null);

  const { mutateAsync } = trpc.stripe.updateSubscription.useMutation({
    onSuccess: () => {
      setTimeout(() => {
        window.location.reload();
        toast.success("Subscription updated");
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message);
      setLoading(null);
    },
  });

  const onSelectPlan = async ({
    plan,
    priceId,
  }: {
    plan: Plan;
    priceId: string;
  }) => {
    setLoading(plan);
    await mutateAsync({ plan, priceId });
  };

  return (
    <BillingPage
      title="Billing"
      description="Update your payment information or switch plans according to your needs"
      displayTrial={false}
    >
      <div className="grid grid-cols-2 gap-12">
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
      />
      <PlansTable period={period} setPeriod={setPeriod} />
    </BillingPage>
  );
}
