import { client } from "@/lib/rpc";
import {
  type ActivityWithTypeAndMember,
  ActivityWithTypeAndMemberSchema,
} from "@conquest/zod/schemas/activity.schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type Props = {
  initialActivities: ActivityWithTypeAndMember[];
};

export const listActivities = ({ initialActivities }: Props) => {
  const query = useInfiniteQuery({
    queryKey: ["activities"],
    queryFn: async ({ pageParam }) => {
      const response = await client.api.activities.$get({
        query: {
          page: pageParam.toString(),
        },
      });
      return ActivityWithTypeAndMemberSchema.array().parse(
        await response.json(),
      );
    },
    getNextPageParam: (_, allPages) => allPages.length + 1,
    initialData: { pages: [initialActivities], pageParams: [1] },
    initialPageParam: 1,
  });

  const activities = useMemo(() => {
    const pages = query.data?.pages;
    if (!pages?.length) return [];
    return pages.flatMap((page) => page ?? []);
  }, [query.data?.pages]);

  return {
    ...query,
    activities,
  };
};
