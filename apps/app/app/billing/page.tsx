"use client";

import { BillingPage } from "@/features/billing/billing-page";
import { PlanPicker } from "@/features/billing/plan-picker";
import { PlansTable } from "@/features/billing/plans-table";
import type { PlanPeriod } from "@/features/billing/types";
import { trpc } from "@/server/client";
import type { Plan } from "@conquest/zod/enum/plan.enum";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [period, setPeriod] = useState<PlanPeriod>("annually");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { mutateAsync } = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (url) => {
      if (!url) return;
      router.push(url);
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
