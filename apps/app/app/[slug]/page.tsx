import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { ActiveMembers } from "@/features/dashboard-v2/active-members";
import { LevelRepartition } from "@/features/dashboard-v2/level-repartition";
import { NewMembers } from "@/features/dashboard-v2/new-members";
import { TotalMembers } from "@/features/dashboard-v2/total-members";
import { loaderDate } from "@/utils/dateParams";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: Props) {
  await loaderDate(searchParams);

  return (
    <PageLayout>
      <Header title="Dashboard" />
      <ScrollArea className="p-4">
        <div className="space-y-4">
          <LevelRepartition />
          <TotalMembers />
          <ActiveMembers />
          <NewMembers />
        </div>
      </ScrollArea>
    </PageLayout>
  );
}
