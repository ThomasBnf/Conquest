import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";

export default function Page() {
  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-12 lg:py-24">
        <p className="font-medium text-2xl">Billing</p>
        <p className="text-muted-foreground">
          Update your payment information or switch plans according to your
          needs
        </p>
        <Separator className="my-4" />
      </div>
    </ScrollArea>
  );
}
