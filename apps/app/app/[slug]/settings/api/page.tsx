import { ApiKeyCard } from "@/features/api-keys/api-key-card";
import { FormAPIKey } from "@/features/api-keys/form-api-key";
import { listAPIKeys } from "@/queries/api-keys/listAPIKeys";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";

export default async function Page() {
  const rApiKeys = await listAPIKeys();
  const apiKeys = rApiKeys?.data;

  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-12 lg:py-24">
        <p className="font-medium text-2xl">API Keys</p>
        <p className="text-muted-foreground">
          Build your own custom integrations by generating API keys to access
          Conquest's API.
        </p>
        <Separator className="my-4" />
        <div className="flex flex-col gap-4">
          <FormAPIKey />
          {apiKeys?.map((apiKey) => (
            <ApiKeyCard key={apiKey.id} apiKey={apiKey} />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
