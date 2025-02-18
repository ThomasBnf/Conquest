"use client";

import { Activities as ActivitiesIcon } from "@/components/icons/Activities";
import { HeaderSubPage } from "@/components/layouts/header-subpage";
import { PageLayout } from "@/components/layouts/page-layout";
import { EmptyState } from "@/components/states/empty-state";
import { IsLoading } from "@/components/states/is-loading";
import { Activities } from "@/features/activities/activities";
import { CompanySidebar } from "@/features/companies/company-sidebar";
import { trpc } from "@/server/client";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  params: {
    companyId: string;
  };
};

export default function Page({ params: { companyId } }: Props) {
  const { data: company, isLoading } = trpc.companies.getCompany.useQuery({
    id: companyId,
  });

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isLoading: isLoadingActivities,
  } = trpc.activities.getCompanyActivities.useInfiniteQuery(
    { companyId, take: 10 },
    { getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id },
  );

  const activities = data?.pages.flat() ?? [];

  if (isLoading || isLoadingActivities) return <IsLoading />;
  if (!company) return;

  return (
    <PageLayout className="m-1 rounded-lg border">
      <HeaderSubPage />
      <div className="flex h-full divide-x overflow-hidden">
        <ScrollArea className="flex-1">
          <Activities
            activities={activities}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isLoading={isLoadingActivities}
          >
            <EmptyState
              icon={<ActivitiesIcon size={36} />}
              title="No activities found"
              description="This company has no activities"
            />
          </Activities>
        </ScrollArea>
        <CompanySidebar company={company} />
      </div>
    </PageLayout>
  );
}
