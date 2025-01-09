import { AtRiskMembers } from "./at-risk-members";
import { MembersChart } from "./members-chart";
import { MembersLevels } from "./members-levels";
import { TopMembers } from "./top-members";

type Props = {
  from: Date;
  to: Date;
};

export const MemberDashboard = ({ from, to }: Props) => {
  return (
    <div className="divide-y border-b">
      <p className="bg-muted p-4 font-medium text-lg">Members metrics</p>
      <MembersChart from={from} to={to} />
      <div className="flex flex-1 items-center gap-2 p-2">
        <AtRiskMembers />
        <AtRiskMembers />
        <AtRiskMembers />
      </div>
      <div className="flex divide-x">
        <TopMembers from={from} to={to} />
        <MembersLevels from={from} to={to} />
      </div>
    </div>
  );
};
