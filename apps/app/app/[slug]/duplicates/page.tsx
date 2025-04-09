"use client";

import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { DuplicateCard } from "@/features/merge/duplicate-card";
import { trpc } from "@/server/client";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function Page() {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, failureReason } =
    trpc.duplicate.list.useInfiniteQuery(
      {},
      { getNextPageParam: (_, allPages) => allPages.length * 10 },
    );

  console.log("failureReason", failureReason);

  const duplicates = data?.pages.flat();
  console.log("duplicates", duplicates);
  const hasNextPage = data?.pages.at(-1)?.length === 10;

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView]);

  return (
    <PageLayout>
      <Header title="Duplicates" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          {duplicates?.map((duplicate) => (
            <DuplicateCard key={duplicate.id} duplicate={duplicate} />
          ))}
          <div ref={ref} className="h-4" />
        </div>
      </div>
    </PageLayout>
  );
}
