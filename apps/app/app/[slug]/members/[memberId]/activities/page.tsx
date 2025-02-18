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
  const { data: member, isLoading } = trpc.members.getMember.useQuery({
    id: memberId,
  });

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isLoading: isLoadingActivities,
  } = trpc.activities.getMemberActivities.useInfiniteQuery(
    { memberId, take: 10 },
    { getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id },
  );

  const activities = data?.pages.flat() ?? [];

  if (isLoading || isLoadingActivities) return <IsLoading />;
  if (!member) return redirect(`/${slug}/members`);

  return (
    <Activities
      activities={activities}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isLoading={isLoadingActivities}
    >
      <EmptyState
        icon={<Activity size={36} />}
        title="No activities found"
        description="This member has no activities"
      />
    </Activities>
  );
}
