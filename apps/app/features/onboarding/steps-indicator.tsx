import { cn } from "../../../../packages/ui/src/lib/utils";

type Props = {
  step: number;
};

export const StepsIndicator = ({ step }: Props) => {
  return (
    <div className="my-4 flex items-center justify-center gap-2">
      <div
        className={cn(
          "size-2.5 rounded-full bg-main-100",
          step === 1 && "bg-main-400",
        )}
      />
      <div
        className={cn(
          "size-2.5 rounded-full bg-main-100",
          step === 2 && "bg-main-400",
        )}
      />
      <div
        className={cn(
          "size-2.5 rounded-full bg-main-100",
          step === 3 && "bg-main-400",
        )}
      />
      <div
        className={cn(
          "size-2.5 rounded-full bg-main-100",
          step === 4 && "bg-main-400",
        )}
      />
    </div>
  );
};
