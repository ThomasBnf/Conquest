import { IntegrationProvider } from "@/context/integrationContext";
import { DiscourseIntegration } from "@/features/discourse/discourse-integration";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: {
    error: string;
  };
};

export default function Page({ searchParams: { error } }: Props) {
  return (
    <ScrollArea className="h-dvh">
      <IntegrationProvider source="Discourse">
        <DiscourseIntegration error={error} />
      </IntegrationProvider>
    </ScrollArea>
  );
}
