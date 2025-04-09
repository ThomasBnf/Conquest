"use client";

import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { DuplicateCard } from "@/features/merge/duplicate-card";
import { trpc } from "@/server/client";

export default function Page() {
  const { data } = trpc.duplicate.list.useQuery();

  return (
    <PageLayout>
      <Header title="Duplicates" />
      <div className="flex flex-col overflow-auto">
        <div className="flex flex-1 flex-col gap-4 p-4">
          {data?.map((duplicate) => (
            <DuplicateCard key={duplicate.id} duplicate={duplicate} />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
