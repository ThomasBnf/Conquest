import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { Activities } from "@/features/activities/components/activities";
import { ScrollArea } from "@conquest/ui/scroll-area";

export default function Page() {
  return (
    <PageLayout>
      <Header title="Activities" />
      <ScrollArea>
        <Activities />
      </ScrollArea>
    </PageLayout>
  );
}
