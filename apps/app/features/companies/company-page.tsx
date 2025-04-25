"use client";

import { HeaderSubPage } from "@/components/layouts/header-subpage";
import { PageLayout } from "@/components/layouts/page-layout";
import { IsLoading } from "@/components/states/is-loading";
import { Activities } from "@/features/activities/activities";
import { CompanySidebar } from "@/features/companies/company-sidebar";
import { trpc } from "@/server/client";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { skipToken } from "@tanstack/react-query";

type Props = {
  companyId: string;
};

export const CompanyPage = ({ companyId }: Props) => {
  const { data: company, isLoading } = trpc.companies.get.useQuery(
    companyId ? { id: companyId } : skipToken,
  );

  const {
    data,
    isLoading: _isLoading,
    fetchNextPage,
    hasNextPage,
  } = trpc.activities.listInfinite.useInfiniteQuery(
    { companyId },
    { getNextPageParam: (_, allPages) => allPages.length * 25 },
  );

  const activities = data?.pages.flat();

  if (isLoading || _isLoading) return <IsLoading />;
  if (!company) return;

  return (
    <PageLayout className="m-1 rounded-lg border">
      <HeaderSubPage />
      <div className="flex h-full divide-x overflow-hidden">
        <ScrollArea className="flex-1">
          <Activities
            activities={activities}
            isLoading={_isLoading}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            type="company"
          />
        </ScrollArea>
        <CompanySidebar company={company} />
      </div>
    </PageLayout>
  );
};
