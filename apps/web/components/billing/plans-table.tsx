import type { Dispatch, SetStateAction } from "react";
import { PeriodToggle } from "./period-toggle";
import { PlanDetails } from "./plan-details";
import { PlanHeader } from "./plan-header";
import { plansFeatures } from "./plans";
import type { PlanPeriod } from "./types";

type Props = {
  period: PlanPeriod;
  setPeriod: Dispatch<SetStateAction<PlanPeriod>>;
};

export const PlansTable = ({ period, setPeriod }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="font-medium text-lg">Compare all features</p>
        <PeriodToggle period={period} setPeriod={setPeriod} />
      </div>
      <div className="flex h-full justify-between divide-x overflow-auto rounded-md border">
        <div className="shrink-0 divide-y bg-sidebar">
          <div className="flex flex-col justify-between p-3 pb-10">
            <p className="font-medium text-lg capitalize">Plans</p>
            <p>
              Billing period
              {period === "annually" && (
                <span className="ml-2 text-main-400">Save 15%</span>
              )}
            </p>
          </div>
          <div className="space-y-3 p-3">
            <p className="font-medium">Number of members</p>
          </div>
          <div className="space-y-3 p-3">
            <p className="font-medium">Number of seats</p>
          </div>
          <div className="space-y-3 p-3">
            <p className="font-medium">Integrations</p>
            <p>Community Platforms</p>
            <p>GitHub</p>
            <p>API</p>
            <p>Socials</p>
            <p>Events platform</p>
          </div>
          <div className="space-y-3 p-3">
            <p className="font-medium">Features</p>
            <p>Member level</p>
            <p>Tags</p>
            <p>Lists</p>
            <p>Activity types</p>
          </div>
        </div>
        <div className="flex h-auto flex-1 divide-x">
          {plansFeatures.map((plan) => (
            <div key={plan.name} className="flex flex-1 flex-col divide-y">
              <PlanHeader plan={plan} period={period} />
              <PlanDetails plan={plan} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
