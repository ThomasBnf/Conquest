import { IntegrationProvider } from "@/context/integrationContext";
import { DiscourseIntegration } from "@/features/discourse/discourse-integration";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: Promise<{
    error: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <ScrollArea className="h-dvh">
      <IntegrationProvider source="Discourse">
        <DiscourseIntegration error={error} />
      </IntegrationProvider>
    </ScrollArea>
  );
}
