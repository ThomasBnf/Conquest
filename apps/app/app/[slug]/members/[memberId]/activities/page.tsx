"use client";

import { EmptyState } from "@/components/states/empty-state";
import { IsLoading } from "@/components/states/is-loading";
import { Activities } from "@/features/activities/activities";
import { trpc } from "@/server/client";
import { Activity } from "lucide-react";
import { redirect } from "next/navigation";

type Props = {
  params: {
    slug: string;
    memberId: string;
  };
};

export default function Page({ params: { slug, memberId } }: Props) {
  const { data: member, isLoading } = trpc.members.get.useQuery({
    id: memberId,
  });

  const { data, isLoading: _isLoading } = trpc.activities.list.useQuery({
    member_id: memberId,
  });

  if (isLoading || _isLoading) return <IsLoading />;
  if (!member) return redirect(`/${slug}/members`);

  return (
    <Activities activities={data} isLoading={_isLoading}>
      <EmptyState
        icon={<Activity size={36} />}
        title="No activities found"
        description="This member has no activities"
      />
    </Activities>
  );
}
