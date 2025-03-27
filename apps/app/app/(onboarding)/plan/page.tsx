"use client";

import { BillingPage } from "@/features/billing/billing-page";
import { PlanPicker } from "@/features/billing/plan-picker";
import type { PlanPeriod } from "@/features/billing/types";
import { StepsIndicator } from "@/features/onboarding/steps-indicator";
import { trpc } from "@/server/client";
import type { Plan } from "@conquest/zod/enum/plan.enum";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { data: session, update } = useSession();
  const { user } = session ?? {};
  const [period, setPeriod] = useState<PlanPeriod>("annually");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { mutateAsync } = trpc.users.update.useMutation({
    onSuccess: () => update(),
    onError: (error) => {
      toast.error(error.message);
      setLoading(false);
    },
  });

  const { mutateAsync: createCustomer } =
    trpc.stripe.createCustomer.useMutation({
      onSuccess: () => update(),
      onError: (error) => {
        toast.error(error.message);
        setLoading(false);
      },
    });

  const { mutateAsync: createContact } = trpc.brevo.createContact.useMutation({
    onSuccess: () => router.push("/settings/integrations"),
    onError: (error) => {
      toast.error(error.message);
      setLoading(false);
    },
  });

  const onComplete = async ({
    plan,
    priceId,
  }: {
    plan: Plan;
    priceId: string;
  }) => {
    if (!user) return;

    setLoading(true);
    await createCustomer({ plan, priceId });
    await mutateAsync({ id: user.id, onboarding: new Date() });
    await createContact({ user });
  };

  return (
    <>
      <BillingPage
        title="Start your 14-day free trial"
        description="Choose a plan that suits your needs"
        displayTrial={false}
      >
        <PlanPicker
          period={period}
          setPeriod={setPeriod}
          onSelectPlan={onComplete}
          loading={loading}
          workspace={user?.workspace}
          trial
        />
      </BillingPage>
      <StepsIndicator step={4} />
    </>
  );
}
