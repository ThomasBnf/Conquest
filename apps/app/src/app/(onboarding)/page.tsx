"use client";

import { Steps } from "@/features/onboarding/Steps";
import { QuestionsStep } from "@/features/onboarding/questions/questions-step";
import { WorkspaceStep } from "@/features/onboarding/workspace/workspace-step";
import { useState } from "react";

export default function Page() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex h-dvh divide-x">
      <div className="flex h-full flex-1 flex-col items-center justify-center">
        <div className="flex flex-col">
          <Steps step={step} />
          <p className="text-xl font-medium">Welcome to Conquest</p>
          <p className="mb-8 text-base text-muted-foreground">
            Tell us a bit about yourself so we can personalize your experience
          </p>
          {step === 1 && <WorkspaceStep setStep={setStep} />}
          {step === 2 && <QuestionsStep />}
        </div>
      </div>
      <div className="flex-1 bg-neutral-50" />
    </div>
  );
}
