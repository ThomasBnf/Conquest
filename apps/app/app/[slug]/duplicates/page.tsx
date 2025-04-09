"use client";

import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { EmptyState } from "@/components/states/empty-state";
import { DuplicateCard } from "@/features/merge/duplicate-card";
import { trpc } from "@/server/client";
import { Duplicate } from "@conquest/ui/icons/Duplicate";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function Page() {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, failureReason } =
    trpc.duplicate.list.useInfiniteQuery(
      {},
      { getNextPageParam: (_, allPages) => allPages.length * 25 },
    );

  console.log(failureReason);

  const duplicates = data?.pages.flat();
  const hasNextPage = data?.pages.at(-1)?.length === 25;

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView]);

  return (
    <PageLayout>
      <Header title="Duplicates" />
      {duplicates && duplicates.length > 0 ? (
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex flex-col overflow-auto">
            {duplicates.map((duplicate) => (
              <DuplicateCard key={duplicate.id} duplicate={duplicate} />
            ))}
            <div ref={ref} />
          </div>
        </div>
      ) : (
        <div className="relative">
          <EmptyState
            title="No duplicates found"
            description="When you have duplicates, you'll see them here."
            icon={<Duplicate size={32} />}
          />
        </div>
      )}
    </PageLayout>
  );
}
