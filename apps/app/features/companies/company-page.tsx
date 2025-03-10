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
  companyId: string;
};

export const CompanyPage = ({ companyId }: Props) => {
  const { data: company, isLoading } = trpc.companies.get.useQuery(
    { id: companyId },
    { enabled: !!companyId },
  );

  const { data, isLoading: _isLoading } = trpc.activities.list.useQuery(
    { company_id: companyId },
    { enabled: !!companyId },
  );

  if (isLoading || _isLoading) return <IsLoading />;
  if (!company) return;

  return (
    <PageLayout className="m-1 rounded-lg border">
      <HeaderSubPage />
      <div className="flex h-full divide-x overflow-hidden">
        <ScrollArea className="flex-1">
          <Activities activities={data} isLoading={_isLoading}>
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
};
