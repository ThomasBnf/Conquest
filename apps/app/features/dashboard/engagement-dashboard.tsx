import { ChannelsTop } from "./channels-top";
import { EngagementChart } from "./engagement-chart";
import { TopActivityTypes } from "./top-activity-types";

type Props = {
  from: Date;
  to: Date;
};

export const EngagementDashboard = ({ from, to }: Props) => {
  return (
    <div className="divide-y border-b">
      <p className="bg-muted p-4 font-medium text-lg">Engagement metrics</p>
      <EngagementChart from={from} to={to} />
      <div className="flex divide-x">
        <ChannelsTop from={from} to={to} />
        <TopActivityTypes from={from} to={to} />
      </div>
    </div>
  );
};
