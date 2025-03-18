import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@conquest/ui/dialog";
import { ScrollArea } from "@conquest/ui/scroll-area";
import type { Plan } from "@conquest/zod/enum/plan.enum";
import { Check, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { PeriodToggle } from "./period-toggle";
import { plans } from "./plans";
import { PlansTable } from "./plans-table";
import type { PlanPeriod } from "./types";

type Props = {
  period: PlanPeriod;
  setPeriod: Dispatch<SetStateAction<PlanPeriod>>;
  loading: Plan | null;
  onSelectPlan: ({
    plan,
    priceId,
  }: {
    plan: Plan;
    priceId: string;
  }) => void;
  trial?: boolean;
};

export const PlanPicker = ({
  period,
  setPeriod,
  onSelectPlan,
  loading,
  trial,
}: Props) => {
  const { data: session } = useSession();
  const { workspace } = session?.user ?? {};
  const [open, setOpen] = useState(false);

  const { plan: currentPlan, is_past_due } = workspace ?? {};

  const onClick = ({
    plan,
    priceId,
  }: {
    plan: Plan;
    priceId: string;
  }) => {
    if (priceId.includes("custom")) return;

    onSelectPlan({ plan, priceId });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="font-medium text-lg">Compare plans</p>
        <PeriodToggle period={period} setPeriod={setPeriod} />
      </div>
      {trial && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="link" className="px-0 text-muted-foreground">
              Compare all features
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Plans</DialogTitle>
            </DialogHeader>
            <DialogBody className="h-full overflow-hidden p-0">
              <ScrollArea className="max-h-[calc(100dvh-5rem)] px-4">
                <div className="py-4">
                  <PlansTable period={period} setPeriod={setPeriod} />
                </div>
              </ScrollArea>
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}
      <div className="flex w-full flex-1 items-start gap-2">
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
                className="w-full"
                disabled={
                  (!is_past_due &&
                    currentPlan === plan.name &&
                    currentPlan === plan.name) ||
                  loading === plan.name
                }
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
                {loading === plan.name ? (
                  <Loader2
                    size={16}
                    className={cn(
                      "animate-spin",
                      plan.popular ? "text-white" : "text-muted-foreground",
                    )}
                  />
                ) : (
                  <>
                    {!is_past_due && currentPlan === plan.name ? (
                      <span>Current plan</span>
                    ) : (
                      <span>
                        {trial ? (
                          "Start a 14-day trial"
                        ) : (
                          <span className="capitalize">
                            Start {plan.name.toLowerCase()}
                          </span>
                        )}
                      </span>
                    )}
                  </>
                )}
              </Button>
              {trial && (
                <p className="text-center text-muted-foreground text-xs">
                  No credit card required
                </p>
              )}
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
