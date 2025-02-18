import { TopActivityTypes } from "./top-activity-types";
import { TopChannels } from "./top-channels";

type Props = {
  from: Date;
  to: Date;
};

export const EngagementDashboard = ({ from, to }: Props) => {
  return (
    <div className="divide-y border-b">
      <p className="bg-muted p-4 font-medium text-lg">Engagement metrics</p>
      <div className="flex divide-x">
        <TopChannels from={from} to={to} />
        <TopActivityTypes from={from} to={to} />
      </div>
    </div>
  );
};
