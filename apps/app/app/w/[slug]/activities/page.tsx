import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { Activities } from "@/features/activities/activities";
import { ScrollArea } from "@conquest/ui/scroll-area";

export default async function Page() {
  return (
    <PageLayout>
      <Header title="Activities" />
      <ScrollArea>
        <Activities />
      </ScrollArea>
    </PageLayout>
  );
}
