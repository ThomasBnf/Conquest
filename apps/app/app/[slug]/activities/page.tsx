import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { _listActivities } from "@/features/activities/actions/_listActivities";
import { Activities } from "@/features/activities/components/activities";
import { ScrollArea } from "@conquest/ui/scroll-area";

export default async function Page() {
  const rActivities = await _listActivities({ page: 1 });
  const activities = rActivities?.data;

  return (
    <PageLayout>
      <Header title="Activities" />
      <ScrollArea>
        {activities && <Activities initialActivities={activities} />}
      </ScrollArea>
    </PageLayout>
  );
}
