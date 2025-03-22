"use client";

import { IsLoading } from "@/components/states/is-loading";
import { trpc } from "@/server/client";
import { ApiKeyCard } from "./api-key-card";

export const ApiKeysList = () => {
  const { data, isLoading } = trpc.apiKeys.list.useQuery();

  if (isLoading) return <IsLoading />;

  return (
    <>
      {data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-md border bg-muted px-6 py-12">
          <div className="flex flex-col items-center">
            <p className="font-medium text-base">No API Keys found</p>
            <p className="text-muted-foreground">
              Create your first API Key to access Conquest's API
            </p>
          </div>
        </div>
      ) : (
        data?.map((apiKey) => <ApiKeyCard key={apiKey.id} apiKey={apiKey} />)
      )}
    </>
  );
};
