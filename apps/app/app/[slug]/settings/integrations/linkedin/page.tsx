import { LinkedInIntegration } from "@/features/integrations/linkedin-integration";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: {
    error: string;
  };
};

export default function Page({ searchParams: { error } }: Props) {
  return (
    <ScrollArea className="h-full">
      <LinkedInIntegration error={error} />
    </ScrollArea>
  );
}
