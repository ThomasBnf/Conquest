"use client";

import { IsLoading } from "@/components/states/is-loading";
import { MemberHeatmap } from "@/features/members/member-heatmap";
import { MemberLevelLogs } from "@/features/members/member-level-logs";
import { MemberPulseLogs } from "@/features/members/member-pulse-logs";
import { trpc } from "@/server/client";
import { redirect } from "next/navigation";

type Props = {
  params: {
    slug: string;
    memberId: string;
  };
};

export default function Page({ params: { slug, memberId } }: Props) {
  const { data: member, isLoading } = trpc.members.getMember.useQuery({
    id: memberId,
  });

  if (isLoading) return <IsLoading />;
  if (!member) return redirect(`/${slug}/members`);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 py-8">
      <MemberHeatmap memberId={memberId} />
      <MemberLevelLogs member={member} />
      <MemberPulseLogs member={member} />
    </div>
  );
}
