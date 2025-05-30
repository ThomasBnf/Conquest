import { cn } from "@conquest/ui/cn";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

type Props = {
  step: number;
};

export const CSVSteps = ({ step }: Props) => {
  const steps = [
    {
      step: 1,
      title: "Upload CSV",
      active: step === 1,
    },
    {
      step: 2,
      title: "Map Columns",
      active: step === 2,
    },
  ];

  return (
    <div className="flex h-12 shrink-0 items-center gap-4 px-4">
      {steps.map((step, index) => (
        <Fragment key={step.step}>
          <div
            className={cn(
              "flex items-center gap-2",
              step.active ? "opacity-100" : "opacity-50",
            )}
          >
            <div className="flex size-5 items-center justify-center rounded-md border bg-main-100/50 font-medium text-xs">
              {step.step}
            </div>
            <p>{step.title}</p>
          </div>
          {index < steps.length - 1 && (
            <ChevronRight size={16} className="text-muted-foreground" />
          )}
        </Fragment>
      ))}
    </div>
  );
};
