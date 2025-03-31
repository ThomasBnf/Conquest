import { cn } from "@conquest/ui/cn";
import type { PlanPeriod, PlanTable } from "./types";

export const PlanHeader = ({
  plan,
  period,
}: { plan: PlanTable; period: PlanPeriod }) => {
  const isAnnually = period === "annually";

  return (
    <div className="flex h-full max-h-[120px] flex-1 flex-col justify-between p-3">
      <p className="font-medium text-lg capitalize">
        {plan.name.slice(0, 1).toUpperCase() + plan.name.slice(1).toLowerCase()}
      </p>
      <div
        className={cn(
          "flex gap-1",
          period === "monthly" ? "items-baseline" : "items-center",
        )}
      >
        <p className="font-medium text-3xl">
          {plan.priceMonthly === "Custom"
            ? "Custom"
            : `$${isAnnually ? plan.priceAnnually : plan.priceMonthly}`}
        </p>
        {plan.name !== "AMBASSADOR" && (
          <div className="flex flex-col">
            <p className="text-muted-foreground text-xs">per month</p>
            {isAnnually && (
              <p className="text-muted-foreground text-xs">billed annually</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
