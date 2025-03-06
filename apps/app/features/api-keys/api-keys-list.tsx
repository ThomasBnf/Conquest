"use client";

import { IsLoading } from "@/components/states/is-loading";
import { trpc } from "@/server/client";
import { ApiKeyCard } from "./api-key-card";

export const ApiKeysList = () => {
  const { data, isLoading } = trpc.apiKeys.list.useQuery();

  if (isLoading) return <IsLoading />;

  return (
    <>
      {data?.map((apiKey) => (
        <ApiKeyCard key={apiKey.id} apiKey={apiKey} />
      ))}
    </>
  );
};
