import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import type { Plan } from "@conquest/zod/enum/plan.enum";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction } from "react";
import { PeriodToggle } from "./period-toggle";
import { plans } from "./plans";
import type { PlanPeriod } from "./types";

type Props = {
  period: PlanPeriod;
  setPeriod: Dispatch<SetStateAction<PlanPeriod>>;
};

export const PlanPicker = ({ period, setPeriod }: Props) => {
  const router = useRouter();

  const onClick = ({
    plan,
    priceId,
  }: {
    plan: Plan;
    priceId: string;
  }) => {
    if (priceId.includes("custom")) return;

    router.push(
      `https://app.useconquest.com/auth/signup?plan=${plan}&priceId=${priceId}`,
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="font-medium text-lg">Compare plans</p>
        <PeriodToggle period={period} setPeriod={setPeriod} />
      </div>
      <div className="flex w-full flex-1 flex-col items-end gap-2 md:flex-row">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "w-full rounded-md bg-main-400",
              !plan.popular && "self-end",
            )}
          >
            {plan.popular && (
              <div className="py-1.5">
                <p className="text-center text-white text-xs">Most popular</p>
              </div>
            )}
            <div
              className={cn(
                "relative flex flex-1 flex-col gap-2 rounded-md border bg-background p-4",
                plan.popular && "border-main-400",
              )}
            >
              <p className="font-medium text-lg capitalize">
                {plan.name.toLowerCase()}
              </p>
              <div
                className={cn(
                  "mb-4 flex gap-1",
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
                      <p className="text-muted-foreground text-xs">
                        billed annually
                      </p>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant={plan.popular ? "default" : "outline"}
                onClick={() =>
                  onClick({
                    plan: plan.name as Plan,
                    priceId:
                      period === "annually"
                        ? plan.priceIdAnnually
                        : plan.priceIdMonthly,
                  })
                }
              >
                Start a 7-day free trial
              </Button>
              <p className="text-center text-muted-foreground text-xs">
                No credit card required
              </p>
              <div className="mt-4">
                <p className="font-medium">{plan.description}</p>
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-main-100 p-0.5">
                      <Check size={13} />
                    </div>
                    <p className="text-muted-foreground">{plan.seats}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="rounded-md bg-main-100 p-0.5">
                      <Check size={13} />
                    </div>
                    <p className="text-muted-foreground">{plan.members}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="rounded-md bg-main-100 p-0.5">
                      <Check size={13} />
                    </div>
                    <p className="text-muted-foreground">{plan.integrations}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="rounded-md bg-main-100 p-0.5">
                      <Check size={13} />
                    </div>
                    <p className="text-muted-foreground">
                      {plan.api && "API & Webhooks"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
