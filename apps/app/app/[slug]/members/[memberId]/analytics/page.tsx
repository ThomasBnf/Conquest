import { MemberHeatmap } from "@/features/members/components/analytics/member-heatmap";
import { MemberLevelLogs } from "@/features/members/components/analytics/member-level-logs";
import { MemberLoveLogs } from "@/features/members/components/analytics/member-love-logs";
import { MemberPresenceLogs } from "@/features/members/components/analytics/member-presence-logs";
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
    <div className="flex flex-col gap-6">
      <MemberHeatmap activities={activities} />
      <MemberLevelLogs member={member} />
      <MemberLoveLogs member={member} />
      <MemberPresenceLogs member={member} />
    </div>
  );
}
