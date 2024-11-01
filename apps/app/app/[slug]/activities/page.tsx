"use client";

import { IsLoading } from "@/components/states/is-loading";
import type { ActivityWithMember } from "@conquest/zod/activity.schema";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";

export default function Page() {
  const { data, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () =>
      await ky
        .get("/api/activities", {
          searchParams: {
            page: 1,
          },
        })
        .json<ActivityWithMember[]>(),
  });

  console.log(data);

  if (isLoading) return <IsLoading />;

  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
    // <PageLayout>
    //   <Header title="Activities" />
    //   <ScrollArea>
    //     <Activities />
    //   </ScrollArea>
    // </PageLayout>
  );
}
