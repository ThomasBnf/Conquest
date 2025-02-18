import { IntegrationProvider } from "@/context/integrationContext";
import { LinkedInIntegration } from "@/features/linkedin/linkedin-integration";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: {
    error: string;
  };
};

export default function Page({ searchParams: { error } }: Props) {
  return (
    <ScrollArea className="h-full">
      <IntegrationProvider source="LINKEDIN">
        <LinkedInIntegration error={error} />
      </IntegrationProvider>
    </ScrollArea>
  );
}
