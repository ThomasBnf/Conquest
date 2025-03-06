import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { ActiveMembers } from "@/features/dashboard/active-members";
import { AtRiskMembers } from "@/features/dashboard/at-risk-members";
import { EngagementRate } from "@/features/dashboard/engagement-rate";
import { NewMembers } from "@/features/dashboard/new-members";
import { TotalMembers } from "@/features/dashboard/total-members";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { searchParamsDate } from "lib/searchParamsDate";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function Page({ searchParams }: Props) {
  searchParamsDate.parse(searchParams);

  return (
    <PageLayout>
      <Header title="Dashboard" />
      <ScrollArea>
        <div className="grid grid-cols-2 gap-2 p-4">
          <TotalMembers />
          <NewMembers />
          <ActiveMembers />
          <EngagementRate />
          <AtRiskMembers />
        </div>
      </ScrollArea>
    </PageLayout>
  );
}
