"use client";

import { useUser } from "@/context/userContext";
import { BillingPage } from "@/features/billing/billing-page";
import { PlanPicker } from "@/features/billing/plan-picker";
import type { PlanPeriod } from "@/features/billing/types";
import { StepsIndicator } from "@/features/onboarding/steps-indicator";
import { trpc } from "@/server/client";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";
import type { Plan } from "@conquest/zod/enum/plan.enum";
import { QuestionsStep } from "features/onboarding/questions/questions-step";
import { WorkspaceStep } from "features/onboarding/workspace/workspace-step";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [period, setPeriod] = useState<PlanPeriod>("monthly");
  const [loading, setLoading] = useState<Plan | null>(null);

  const router = useRouter();
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.users.update.useMutation({
    onSuccess: () => {
      utils.users.get.invalidate();
      router.push("/settings/integrations");
    },
    onError: (error) => {
      toast.error(error.message);
      setLoading(null);
    },
  });

  const { mutateAsync: createCustomer } =
    trpc.stripe.createCustomer.useMutation({
      onSuccess: () => {
        utils.workspaces.get.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
        setLoading(null);
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

    setLoading(plan);
    await createCustomer({ plan, priceId });
    await mutateAsync({ ...user, onboarding: new Date() });
  };

  if (step === 3)
    return (
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
          trial
        />
      </BillingPage>
    );

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <StepsIndicator step={step} />
        <CardTitle>Welcome to Conquest</CardTitle>
        <CardDescription>
          Tell us a bit about yourself so we can personalize your experience
        </CardDescription>
      </CardHeader>
      {step === 1 && <WorkspaceStep setStep={setStep} />}
      {step === 2 && <QuestionsStep setStep={setStep} />}
    </Card>
  );
}
