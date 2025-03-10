import { IntegrationProvider } from "@/context/integrationContext";
import { GithubIntegration } from "@/features/github/github-integration";
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
      <IntegrationProvider source="Github">
        <GithubIntegration error={error} />
      </IntegrationProvider>
    </ScrollArea>
  );
}
