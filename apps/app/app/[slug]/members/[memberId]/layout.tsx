"use client";

import { HeaderSubPage } from "@/components/layouts/header-subpage";
import { PageLayout } from "@/components/layouts/page-layout";
import { IsLoading } from "@/components/states/is-loading";
import { CreateActivityDialog } from "@/features/activities/create-activity-dialog";
import { MemberSidebar } from "@/features/members/member-sidebar";
import { MenuMember } from "@/features/members/menu-member";
import { Tabs } from "@/features/members/tabs";
import { trpc } from "@/server/client";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

type Props = {
  params: {
    slug: string;
    memberId: string;
  };
};

export default function Layout({
  children,
  params: { slug, memberId },
}: PropsWithChildren<Props>) {
  const { data: member, isLoading } = trpc.members.get.useQuery({
    id: memberId,
  });

  const { data: profiles, isLoading: isLoadingProfiles } =
    trpc.profiles.list.useQuery({
      member_id: memberId,
    });

  if (isLoading || isLoadingProfiles) return <IsLoading />;
  if (!member) return redirect(`/${slug}/members`);

  return (
    <div className="flex h-full w-full p-1">
      <PageLayout className="flex h-full rounded-lg border shadow-lg">
        <HeaderSubPage>
          <div className="flex items-center gap-2">
            <CreateActivityDialog member={member} />
            <MenuMember member={member} />
          </div>
        </HeaderSubPage>
        <div className="flex h-full divide-x overflow-hidden">
          <div className="flex flex-1 flex-col divide-y overflow-hidden">
            <Tabs />
            <ScrollArea className="h-full">{children}</ScrollArea>
          </div>
          <MemberSidebar member={member} profiles={profiles} />
        </div>
      </PageLayout>
    </div>
  );
}
