"use client";

import { ActivityTypeTop } from "./activity-type-top";
import { ChannelsTop } from "./channels-top";
import { EngagementChart } from "./engagement-chart";

type Props = {
  from: Date;
  to: Date;
};

export const EngagementDashboard = ({ from, to }: Props) => {
  return (
    <div className="divide-y border-b">
      <p className="p-4 text-lg font-medium bg-muted">Engagement metrics</p>
      <EngagementChart from={from} to={to} />
      <div className="flex divide-x">
        <ChannelsTop from={from} to={to} />
        <ActivityTypeTop from={from} to={to} />
      </div>
    </div>
  );
};
