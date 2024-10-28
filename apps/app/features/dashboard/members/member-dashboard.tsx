"use client";

import { MembersChart } from "./members-chart";
import { MembersTop } from "./members-top";

type Props = {
  from: Date;
  to: Date;
};

export const MemberDashboard = ({ from, to }: Props) => {
  return (
    <div className="divide-y border-b">
      <p className="p-4 text-lg font-medium bg-muted">Members metrics</p>
      <MembersChart from={from} to={to} />
      <div className="flex divide-x">
        <MembersTop from={from} to={to} />
        <div className="flex-1" />
      </div>
    </div>
  );
};
