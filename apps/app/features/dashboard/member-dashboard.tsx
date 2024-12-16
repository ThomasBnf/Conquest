import { MembersChart } from "./members-chart";
import { MembersLevels } from "./members-levels";
import { MembersTop } from "./members-top";

type Props = {
  from: Date;
  to: Date;
};

export const MemberDashboard = ({ from, to }: Props) => {
  return (
    <div className="divide-y border-b">
      <p className="bg-muted p-4 font-medium text-lg">Members metrics</p>
      <MembersChart from={from} to={to} />
      <div className="flex divide-x">
        <MembersTop from={from} to={to} />
        <MembersLevels from={from} to={to} />
      </div>
    </div>
  );
};
