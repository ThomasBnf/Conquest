import { IntegrationProvider } from "@/context/integrationContext";
import { GithubIntegration } from "@/features/github/github-integration";
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
      <IntegrationProvider source="Github">
        <GithubIntegration message={message} />
      </IntegrationProvider>
    </ScrollArea>
  );
}
