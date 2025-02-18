import { WebhookForm } from "@/features/webhooks/webhook-form";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";

export default async function Page() {
  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-12 lg:py-24">
        <p className="font-medium text-2xl">Webhooks</p>
        <p className="text-muted-foreground">
          You can create webhooks for receiving events from Conquest.
        </p>
        <Separator className="my-4" />
        <div className="flex flex-col gap-4">
          <WebhookForm />
        </div>
      </div>
    </ScrollArea>
  );
}
