"use client";

import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { EmptyState } from "@/components/states/empty-state";
import { DuplicateCard } from "@/features/merge/duplicate-card";
import { trpc } from "@/server/client";
import { Duplicate } from "@conquest/ui/icons/Duplicate";

export default function Page() {
  const { data } = trpc.duplicate.list.useQuery();

  return (
    <PageLayout>
      <Header title="Duplicates" />
      {data?.length ? (
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex flex-col overflow-auto">
            {data.map((duplicate) => (
              <DuplicateCard key={duplicate.id} duplicate={duplicate} />
            ))}
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
