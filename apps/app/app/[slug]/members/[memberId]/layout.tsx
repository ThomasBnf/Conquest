import { HeaderSubPage } from "@/components/layouts/header-subpage";
import { PageLayout } from "@/components/layouts/page-layout";
import { AddActivityDialog } from "@/features/activities/add-activity-dialog";
import { MemberMenu } from "@/features/members/components/details/member-menu";
import { MemberSidebar } from "@/features/members/components/details/member-sidebar";
import { Tabs } from "@/features/members/components/tabs";
import { getMember } from "@/queries/members/getMember";
import { listTags } from "@/queries/tags/listTags";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

type Props = {
  params: {
    memberId: string;
  };
};

export default async function Layout({
  children,
  params: { memberId },
}: PropsWithChildren<Props>) {
  const user = await getCurrentUser();
  const slug = user.workspace.slug;
  const workspace_id = user.workspace_id;

  const member = await getMember({ id: memberId, workspace_id });
  const tags = await listTags({ workspace_id });

  if (!member) redirect(`/${slug}/members`);

  return (
    <div className="flex h-full w-full p-1">
      <PageLayout className="flex h-full rounded-lg border shadow-lg">
        <HeaderSubPage>
          <div className="flex items-center gap-2">
            <AddActivityDialog member={member} />
            <MemberMenu member={member} />
          </div>
        </HeaderSubPage>
        <div className="flex h-full divide-x overflow-hidden">
          <div className="flex flex-1 flex-col divide-y overflow-hidden">
            <Tabs />
            <ScrollArea className="h-full">{children}</ScrollArea>
          </div>
          <MemberSidebar member={member} tags={tags} />
        </div>
      </PageLayout>
    </div>
  );
}
