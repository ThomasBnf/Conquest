import { ApiKeyCard } from "@/features/api-keys/components/ApiKeyCard";
import { FormAPIKey } from "@/features/api-keys/components/FormAPI";
import { listAPIKeys } from "@/features/api-keys/functions/listAPIKeys";
import { ScrollArea } from "@conquest/ui/scroll-area";

export default async function Page() {
  const rApiKeys = await listAPIKeys();
  const apiKeys = rApiKeys?.data;

  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-3xl flex-col py-24">
        <p className="font-medium text-2xl">API</p>
        <div className="mt-6 flex flex-col gap-4">
          <div>
            <p className="font-medium">API Keys</p>
            <p className="text-muted-foreground">
              You can create api keys for accessing Conquest API to build your
              own integrations.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <FormAPIKey />
            {apiKeys?.map((apiKey) => (
              <ApiKeyCard key={apiKey.id} apiKey={apiKey} />
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
