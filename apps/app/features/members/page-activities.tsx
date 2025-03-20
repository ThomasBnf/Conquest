"use client";

import { EmptyState } from "@/components/states/empty-state";
import { IsLoading } from "@/components/states/is-loading";
import { Activities } from "@/features/activities/activities";
import { trpc } from "@/server/client";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Activity } from "lucide-react";
import { redirect } from "next/navigation";

type Props = {
  slug: string;
  memberId: string;
};

export const PageActivities = ({ slug, memberId }: Props) => {
  const { data: member, isLoading } = trpc.members.get.useQuery({
    id: memberId,
  });

  const {
    data,
    isLoading: _isLoading,
    fetchNextPage,
    hasNextPage,
  } = trpc.activities.listInfinite.useInfiniteQuery(
    { member_id: memberId, limit: 25 },
    {
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === 25 ? allPages.length * 25 : undefined,
    },
  );

  const activities = data?.pages.flat();
  console.log(activities);

  if (isLoading || _isLoading) return <IsLoading />;
  if (!member) return redirect(`/${slug}/members`);

  return (
    <ScrollArea className="h-full">
      <Activities
        activities={activities}
        isLoading={_isLoading}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
      >
        <EmptyState
          icon={<Activity size={36} />}
          title="No activities found"
          description="This member has no activities"
        />
      </Activities>
    </ScrollArea>
  );
};
