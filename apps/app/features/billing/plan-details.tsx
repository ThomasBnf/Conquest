import { Check } from "lucide-react";
import type { PlansTable } from "./types";

export const PlanDetails = ({ plan }: { plan: PlansTable }) => (
  <div className="flex h-full flex-1 flex-col divide-y text-muted-foreground">
    <div className="p-3">
      <p>{plan.members}</p>
    </div>
    <div className="p-3">
      <p>{plan.seats}</p>
    </div>
    <div className="space-y-3 p-3">
      <p>{plan.integrations.count}</p>
      <p className="h-5 place-content-center">
        <FeatureCheck isEnabled={plan.integrations.discord} />
      </p>
      <p className="h-5 place-content-center">
        <FeatureCheck isEnabled={plan.integrations.discourse} />
      </p>
      <p className="h-5 place-content-center">
        <FeatureCheck isEnabled={plan.integrations.slack} />
      </p>
      <p className="h-5 place-content-center">
        <FeatureCheck isEnabled={plan.integrations.github} />
      </p>
      <p className="h-5 place-content-center">
        <FeatureCheck isEnabled={plan.integrations.livestorm} />
      </p>
      <p className="h-5 place-content-center">
        <FeatureCheck isEnabled={plan.integrations.api} />
      </p>
    </div>
    <div className="space-y-3 p-3">
      <p className="h-5" />
      <p>{plan.workflows.included}</p>
      <p>{plan.workflows.additional}</p>
    </div>
    <div className="space-y-3 p-3">
      <p className="h-5" />
      <p className="h-5 place-content-center">
        <FeatureCheck isEnabled={plan.features.memberLevel} />
      </p>
      <p className="h-5 place-content-center">{plan.features.tags}</p>
      <p className="h-5 place-content-center">{plan.features.lists}</p>
      <p className="h-5 place-content-center">{plan.features.activityTypes}</p>
      <p className="h-5 place-content-center">{plan.features.tasks}</p>
    </div>
  </div>
);

const FeatureCheck = ({ isEnabled }: { isEnabled: boolean }) => {
  return isEnabled ? <Check size={16} className="text-main-400" /> : null;
};
