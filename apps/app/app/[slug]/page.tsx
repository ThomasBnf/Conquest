import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
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
      <ScrollArea>
        <div className="divide-y p-4">
          <TotalMembers />
        </div>
      </ScrollArea>
    </PageLayout>
  );
}
