import { HeaderSubPage } from "@/components/layouts/header-subpage";
import { PageLayout } from "@/components/layouts/page-layout";
import { _listActivities } from "@/features/activities/actions/_listActivities";
import { Activities } from "@/features/activities/components/activities";
import { _getMember } from "@/features/members/actions/_getMember";
import { MemberMenu } from "@/features/members/components/member-menu";
import { MemberSidebar } from "@/features/members/components/member-sidebar";
import { listTags } from "@/features/tags/functions/listTags";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { redirect } from "next/navigation";

type Props = {
  params: {
    slug: string;
    memberId: string;
  };
};

export default async function Page({ params: { memberId, slug } }: Props) {
  const rMember = await _getMember({ id: memberId });
  const rActivities = await _listActivities({ member_id: memberId, page: 1 });
  const rTags = await listTags();

  const member = rMember?.data;
  const tags = rTags?.data;
  const activities = rActivities?.data;

  if (!member) redirect(`/${slug}/members`);

  return (
    <PageLayout>
      <HeaderSubPage title="Members" currentPage={member.full_name ?? ""}>
        <MemberMenu member={member} />
      </HeaderSubPage>
      <div className="flex divide-x h-full overflow-hidden">
        <ScrollArea className="flex-1">
          {activities && (
            <Activities
              member_id={memberId}
              initialActivities={activities}
              className="px-8"
            />
          )}
        </ScrollArea>
        <MemberSidebar member={member} tags={tags} />
      </div>
    </PageLayout>
  );
}
