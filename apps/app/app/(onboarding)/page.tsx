"use client";

import { SignOut } from "@/components/icons/SignOut";
import { useUser } from "@/context/userContext";
import { Button } from "@conquest/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";
import { Steps } from "features/onboarding/Steps";
import { QuestionsStep } from "features/onboarding/questions/questions-step";
import { WorkspaceStep } from "features/onboarding/workspace/workspace-step";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function Page() {
  const { user } = useUser();
  const [step, setStep] = useState(1);

  const onClick = async () => {
    signOut({ callbackUrl: "/auth/login", redirect: true });
  };

  return (
    <div className="flex h-full flex-col justify-between p-4 lg:px-8 bg-muted/30">
      <div className="flex items-center justify-between">
        <Button onClick={onClick} variant="outline" className="self-start">
          <SignOut className="size-[18px]" />
          Log out
        </Button>
        <div>
          <p className="text-xs text-muted-foreground">Logged in as:</p>
          <p className="text-sm">{user?.email}</p>
        </div>
      </div>
      <Card className="max-w-xl mx-auto w-full">
        <CardHeader>
          <Steps step={step} />
          <CardTitle>Welcome to Conquest</CardTitle>
          <CardDescription>
            Tell us a bit about yourself so we can personalize your experience
          </CardDescription>
        </CardHeader>
        {step === 1 && <WorkspaceStep setStep={setStep} />}
        {step === 2 && <QuestionsStep />}
      </Card>
      <div />
    </div>
  );
}
