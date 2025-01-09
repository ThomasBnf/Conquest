import { MemberHeatmap } from "@/features/members/components/analytics/member-heatmap";
import { MemberLevelLogs } from "@/features/members/components/analytics/member-level-logs";
import { MemberPresenceLogs } from "@/features/members/components/analytics/member-presence-logs";
import { MemberPulseLogs } from "@/features/members/components/analytics/member-pulse-logs";
import { listMemberActivitiesCount } from "@/queries/activities/listMemberActivitiesCount";
import { getMember } from "@/queries/members/getMember";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { redirect } from "next/navigation";

type Props = {
  params: {
    memberId: string;
  };
};

export default async function Page({ params: { memberId } }: Props) {
  const user = await getCurrentUser();
  const workspace_id = user.workspace_id;

  const member = await getMember({
    id: memberId,
    workspace_id,
  });

  const activities = await listMemberActivitiesCount({
    member_id: memberId,
    workspace_id,
  });

  if (!member) redirect("/members");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 py-8">
      <MemberHeatmap activities={activities} />
      <MemberLevelLogs member={member} />
      <MemberPulseLogs member={member} />
      <MemberPresenceLogs member={member} />
    </div>
  );
}
