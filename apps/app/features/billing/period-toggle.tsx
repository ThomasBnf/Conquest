import { cn } from "../../../../packages/ui/src/lib/utils";
import type { PlanPeriod } from "./types";

export const PeriodToggle = ({
  period,
  setPeriod,
}: {
  period: PlanPeriod;
  setPeriod: (period: PlanPeriod) => void;
}) => (
  <div className="flex w-fit items-center rounded-md border bg-muted p-px transition-all">
    <button
      type="button"
      className={cn(
        "flex h-full items-center gap-2 rounded-md px-2",
        period === "annually" ? "bg-background" : "text-muted-foreground",
      )}
      onClick={() => setPeriod("annually")}
    >
      <p className="p-1.5">Annual</p>
      <div className="w-fit rounded-md border border-main-200 bg-main-100/40 px-1 py-0.5">
        <p className="text-main-500 text-xs">-15%</p>
      </div>
    </button>
    <button
      type="button"
      className={cn(
        "flex h-full items-center gap-2 rounded-md px-2",
        period === "monthly" ? "bg-background" : "text-muted-foreground",
      )}
      onClick={() => setPeriod("monthly")}
    >
      <p className="p-1.5">Monthly</p>
    </button>
  </div>
);
