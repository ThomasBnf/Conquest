"use client";

import { IsLoading } from "@/components/states/is-loading";
import { Activities } from "@/features/activities/activities";
import { trpc } from "@/server/client";
import { ScrollArea } from "@conquest/ui/scroll-area";
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
    { member_id: memberId },
    { getNextPageParam: (_, allPages) => allPages.length * 25 },
  );

  console.log(data);

  const activities = data?.pages.flat();

  if (isLoading || _isLoading) return <IsLoading />;
  if (!member) return redirect(`/${slug}/members`);

  return (
    <ScrollArea className="h-full">
      <Activities
        activities={activities}
        isLoading={_isLoading}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        type="member"
      />
    </ScrollArea>
  );
};
