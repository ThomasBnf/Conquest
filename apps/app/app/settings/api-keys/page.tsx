import { ApiKeysList } from "@/features/api-keys/api-keys-list";
import { FormAPIKey } from "@/features/api-keys/form-api-key";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";

export default function Page() {
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
          <ApiKeysList />
        </div>
      </div>
    </ScrollArea>
  );
}
