import { cn } from "@conquest/ui/cn";

type Props = {
  step: number;
};

export const StepsIndicator = ({ step }: Props) => {
  return (
    <div className="mb-4 flex items-center gap-4">
      <p className="text-muted-foreground">Step {step} of 2</p>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "size-2.5 rounded-full bg-main-200",
            step === 1 && "bg-main-600",
          )}
        />
        <div
          className={cn(
            "size-2.5 rounded-full bg-main-200",
            step === 2 && "bg-main-600",
          )}
        />
      </div>
    </div>
  );
};
