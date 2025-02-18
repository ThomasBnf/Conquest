import { IntegrationProvider } from "@/context/integrationContext";
import { GithubIntegration } from "@/features/github/github-integration";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: {
    error: string;
  };
};

export default async function Page({ searchParams: { error } }: Props) {
  return (
    <ScrollArea className="h-dvh">
      <IntegrationProvider source="GITHUB">
        <GithubIntegration error={error} />
      </IntegrationProvider>
    </ScrollArea>
  );
}
