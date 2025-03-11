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
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.users.update.useMutation({
    onSuccess: () => {
      utils.users.get.invalidate();
      router.push("/settings/integrations");
    },
    onError: (error) => {
      toast.error(error.message);
      setLoading(false);
    },
  });

  const onComplete = async () => {
    if (!user) return;

    setLoading(true);
    await mutateAsync({ ...user, onboarding: new Date() });
  };

  if (step === 3) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <img src="/logo.svg" alt="Conquest" className="size-44" />
        <h1 className="mb-4 font-bold text-5xl text-foreground">
          Welcome to Conquest
        </h1>
        <p className="mb-8 max-w-xl text-balance text-center text-muted-foreground">
          Conquest is the CRM you need to track, understand, engage and scale
          your community.
        </p>
        <Button
          onClick={onComplete}
          disabled={loading}
          className={cn(buttonVariants({ size: "lg" }), "min-w-64")}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Get Started"
          )}
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
