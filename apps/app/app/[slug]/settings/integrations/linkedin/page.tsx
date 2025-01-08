import { Linkedin } from "@/components/icons/Linkedin";
import { IntegrationHeader } from "@/features/integrations/integration-header";
import { ConnectedCard } from "@/features/linkedin/connected-card";
import { EnableCard } from "@/features/linkedin/enable-card";
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
            <Linkedin />
          </div>
          <p className="font-medium text-lg">Linkedin</p>
        </div>
        <EnableCard error={error} />
        <ConnectedCard />
      </div>
    </ScrollArea>
  );
}
