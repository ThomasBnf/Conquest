import { IntegrationProvider } from "@/context/integrationContext";
import { DiscourseIntegration } from "@/features/discourse/discourse-integration";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: Promise<{
    message: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const { message } = await searchParams;

  return (
    <ScrollArea className="h-dvh">
      <IntegrationProvider source="Discourse">
        <DiscourseIntegration message={message} />
      </IntegrationProvider>
    </ScrollArea>
  );
}
