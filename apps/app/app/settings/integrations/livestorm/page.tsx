import { IntegrationProvider } from "@/context/integrationContext";
import { LivestormIntegration } from "@/features/livestorm/livestorm-integration";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: Promise<{
    error: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <ScrollArea className="h-full">
      <IntegrationProvider source="Livestorm">
        <LivestormIntegration error={error} />
      </IntegrationProvider>
    </ScrollArea>
  );
}
