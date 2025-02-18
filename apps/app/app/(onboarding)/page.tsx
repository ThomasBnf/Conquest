"use client";

import { useUser } from "@/context/userContext";
import { StepsIndicator } from "@/features/onboarding/steps-indicator";
import { trpc } from "@/server/client";
import { Button, buttonVariants } from "@conquest/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import { QuestionsStep } from "features/onboarding/questions/questions-step";
import { WorkspaceStep } from "features/onboarding/workspace/workspace-step";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { mutateAsync } = trpc.users.updateUser.useMutation({
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  const onComplete = async () => {
    if (!user) return;

    setLoading(true);
    await mutateAsync({
      id: user.id,
      data: { onboarding: new Date() },
    });

    router.push("/settings/integrations");
  };

  if (step === 3) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <img src="/logo.svg" alt="Conquest" className="mb-8 size-20" />
        <h1 className="mb-4 font-bold text-5xl text-foreground">
          Welcome to Conquest
        </h1>
        <p className="mb-8 max-w-xl text-balance text-center text-muted-foreground">
          Conquest is the CRM you need to track, understand, engage and scale
          your community.
        </p>
        <Button
          onClick={onComplete}
          loading={loading}
          disabled={loading}
          className={cn(buttonVariants({ size: "lg" }), "min-w-64")}
        >
          Get Started
        </Button>
      </div>
    );
  }

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
