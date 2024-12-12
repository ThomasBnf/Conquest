import { MemberActivities } from "@/features/activities/member-activities";
import { listMemberActivities } from "@/queries/activities/listMemberActivities";
import { getCurrentUser } from "@/queries/users/getCurrentUser";

type Props = {
  params: {
    memberId: string;
  };
};

export default async function Page({ params: { memberId } }: Props) {
  const user = await getCurrentUser();
  const workspace_id = user.workspace_id;

  const activities = await listMemberActivities({
    member_id: memberId,
    workspace_id,
    page: 1,
  });

  return (
    <MemberActivities member_id={memberId} initialActivities={activities} />
  );
}
