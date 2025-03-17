import { cn } from "@conquest/ui/cn";
import type { Plan, PlanPeriod } from "./types";

export const PlanHeader = ({
  plan,
  period,
}: { plan: Plan; period: PlanPeriod }) => (
  <div className="flex h-full max-h-[120px] flex-1 flex-col justify-between p-3">
    <p className="font-medium text-lg capitalize">{plan.name.toLowerCase()}</p>
    <div
      className={cn(
        "flex gap-1",
        period === "monthly" ? "items-baseline" : "items-center",
      )}
    >
      <p className="font-medium text-3xl">
        {plan.priceMonthly === "Custom"
          ? "Custom"
          : `$${period === "annually" ? plan.priceAnnually : plan.priceMonthly}`}
      </p>
      {plan.name !== "AMBASSADOR" && (
        <div className="flex flex-col">
          <p className="text-muted-foreground text-xs">per month</p>
          {period === "annually" && (
            <p className="text-muted-foreground text-xs">billed annually</p>
          )}
        </div>
      )}
    </div>
  </div>
);
