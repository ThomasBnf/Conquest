import { Discord } from "@/components/icons/Discord";
import { ConnectedCard } from "@/features/discord/connected-card";
import { EnableCard } from "@/features/discord/enable-card";
import { IntegrationHeader } from "@/features/integrations/integration-header";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: {
    error: string;
  };
};

export default function Page({ searchParams: { error } }: Props) {
  return (
    <ScrollArea className="h-full">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-12 lg:py-24">
        <IntegrationHeader />
        <div className="flex items-center gap-4">
          <div className="rounded-md border p-3">
            <Discord />
          </div>
          <p className="font-medium text-lg">Discord</p>
        </div>
        <EnableCard error={error} />
        <ConnectedCard />
      </div>
    </ScrollArea>
  );
}
