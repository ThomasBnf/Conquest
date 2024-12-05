import { HeaderSubPage } from "@/components/layouts/header-subpage";
import { PageLayout } from "@/components/layouts/page-layout";
import { MemberActivities } from "@/features/activities/member-activities";
import { MemberMenu } from "@/features/members/components/details/member-menu";
import { MemberSidebar } from "@/features/members/components/details/member-sidebar";
import { listMemberActivities } from "@/queries/activities/listMemberActivities";
import { getMember } from "@/queries/members/getMember";
import { listTags } from "@/queries/tags/listTags";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { redirect } from "next/navigation";

type Props = {
  params: {
    slug: string;
    memberId: string;
  };
};

export default async function Page({ params: { memberId, slug } }: Props) {
  const user = await getCurrentUser();
  const workspace_id = user.workspace_id;

  const member = await getMember({ id: memberId, workspace_id });
  const activities = await listMemberActivities({
    member_id: memberId,
    workspace_id,
    page: 1,
  });
  const tags = await listTags({ workspace_id });

  if (!member) redirect(`/${slug}/members`);

  return (
    <div className="flex h-full w-full p-1">
      <PageLayout className="flex h-full rounded-lg border shadow-lg">
        <HeaderSubPage>
          <MemberMenu member={member} />
        </HeaderSubPage>
        <div className="flex h-full divide-x overflow-hidden">
          <ScrollArea className="flex-1">
            <MemberActivities
              member_id={memberId}
              initialActivities={activities}
            />
          </ScrollArea>
          <MemberSidebar member={member} tags={tags} />
        </div>
      </PageLayout>
    </div>
  );
}
