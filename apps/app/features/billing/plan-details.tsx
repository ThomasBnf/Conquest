import { Check } from "lucide-react";
import type { Plan } from "./types";

export const PlanDetails = ({ plan }: { plan: Plan }) => (
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
        <FeatureCheck isEnabled={plan.integrations.community} />
      </p>
      <p className="h-5 place-content-center">
        <FeatureCheck isEnabled={plan.integrations.github} />
      </p>
      <p className="h-5 place-content-center">
        <FeatureCheck isEnabled={plan.integrations.api} />
      </p>
      <p className="h-5 place-content-center">
        <FeatureCheck isEnabled={plan.integrations.socials} />
      </p>
      <p className="h-5 place-content-center">
        <FeatureCheck isEnabled={plan.integrations.events} />
      </p>
    </div>
    <div className="space-y-3 p-3">
      <p className="h-5"> </p>
      <p className="h-5 place-content-center">
        <FeatureCheck isEnabled={plan.features.memberLevel} />
      </p>
      <p className="h-5 place-content-center">{plan.features.tags}</p>
      <p className="h-5 place-content-center">{plan.features.lists}</p>
      <p className="h-5 place-content-center">{plan.features.activityTypes}</p>
    </div>
  </div>
);

const FeatureCheck = ({ isEnabled }: { isEnabled: boolean }) => {
  return isEnabled ? <Check size={16} className="text-main-400" /> : null;
};
