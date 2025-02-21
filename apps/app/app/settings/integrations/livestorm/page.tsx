import { IntegrationProvider } from "@/context/integrationContext";
import { LivestormIntegration } from "@/features/livestorm/livestorm-integration";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: {
    error: string;
  };
};

export default function Page({ searchParams: { error } }: Props) {
  return (
    <ScrollArea className="h-full">
      <IntegrationProvider source="LIVESTORM">
        <LivestormIntegration error={error} />
      </IntegrationProvider>
    </ScrollArea>
  );
}
