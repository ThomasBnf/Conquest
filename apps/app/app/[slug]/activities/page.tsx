import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { Activities } from "@/features/activities/activities";
import { listActivities } from "@/queries/activities/listActivities";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
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
