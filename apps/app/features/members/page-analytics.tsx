"use client";

import { IsLoading } from "@/components/states/is-loading";
import { MemberLevelLogs } from "@/features/members/member-level-logs";
import { MemberPulseLogs } from "@/features/members/member-pulse-logs";
import { trpc } from "@/server/client";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { redirect } from "next/navigation";
import { MemberHeatmap } from "./member-heatmap";

type Props = {
  slug: string;
  memberId: string;
};

export const PageAnalytics = ({ slug, memberId }: Props) => {
  const { data: member, isLoading } = trpc.members.get.useQuery({
    id: memberId,
  });

  if (isLoading) return <IsLoading />;
  if (!member) return redirect(`/${slug}/members`);

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 overflow-hidden p-4 py-8">
        <MemberHeatmap memberId={memberId} />
        <MemberLevelLogs member={member} />
        <MemberPulseLogs member={member} />
      </div>
    </ScrollArea>
  );
};
