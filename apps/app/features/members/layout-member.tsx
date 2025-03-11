"use client";

import { HeaderSubPage } from "@/components/layouts/header-subpage";
import { PageLayout } from "@/components/layouts/page-layout";
import { IsLoading } from "@/components/states/is-loading";
import { CreateActivityDialog } from "@/features/activities/create-activity-dialog";
import { MenuMember } from "@/features/members/menu-member";
import { trpc } from "@/server/client";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";
import { MemberSidebar } from "./member-sidebar";
import { TabsMember } from "./tabs-member";

type Props = {
  slug: string;
  memberId: string;
};

export const LayoutMember = ({
  slug,
  memberId,
  children,
}: PropsWithChildren<Props>) => {
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
            <TabsMember />
            {children}
          </div>
          <MemberSidebar member={member} profiles={profiles} />
        </div>
      </PageLayout>
    </div>
  );
};
