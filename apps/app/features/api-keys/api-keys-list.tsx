"use client";

import { trpc } from "@/server/client";
import { ApiKeyCard } from "./api-key-card";

export const ApiKeysList = () => {
  const { data } = trpc.apiKeys.list.useQuery();

  return (
    <>
      {data?.map((apiKey) => (
        <ApiKeyCard key={apiKey.id} apiKey={apiKey} />
      ))}
    </>
  );
};
