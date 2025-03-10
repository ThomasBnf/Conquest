import { IntegrationProvider } from "@/context/integrationContext";
import { LinkedInIntegration } from "@/features/linkedin/linkedin-integration";
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
      <IntegrationProvider source="Linkedin">
        <LinkedInIntegration error={error} />
      </IntegrationProvider>
    </ScrollArea>
  );
}
