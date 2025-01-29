import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { Activities } from "@/features/activities/activities";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { listActivities } from "@conquest/db/queries/activities/listActivities";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { notFound } from "next/navigation";

export default async function Page() {
  const user = await getCurrentUser();
  const { workspace_id } = user;

  if (!workspace_id) return notFound();

  const activities = await listActivities({ page: 1, workspace_id });

  return (
    <PageLayout>
      <Header title="Activities" />
      <ScrollArea className="h-full">
        <Activities initialActivities={activities} />
      </ScrollArea>
    </PageLayout>
  );
}
