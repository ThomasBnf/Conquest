"use client";

import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { IsLoading } from "@/components/states/is-loading";
import { DuplicateCard } from "@/features/merge/duplicate-card";
import { EmptyDuplicates } from "@/features/merge/empty-duplicates";
import { trpc } from "@/server/client";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function Page() {
  const { ref, inView } = useInView();

  const { data, isLoading, fetchNextPage } =
    trpc.duplicate.list.useInfiniteQuery(
      {},
      { getNextPageParam: (_, allPages) => allPages.length * 10 },
    );

  const duplicates = data?.pages.flat();
  const hasNextPage = data?.pages.at(-1)?.length === 10;

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView]);

  if (isLoading) return <IsLoading />;

  return (
    <PageLayout>
      <Header title="Duplicates" />
      <div className="flex-1 overflow-y-auto">
        {duplicates?.length === 0 ? (
          <EmptyDuplicates />
        ) : (
          <div className="flex flex-col gap-4 p-4">
            {duplicates?.map((duplicate) => (
              <DuplicateCard key={duplicate.id} duplicate={duplicate} />
            ))}
            <div ref={ref} />
          </div>
        )}
      </div>
    </PageLayout>
  );
}
