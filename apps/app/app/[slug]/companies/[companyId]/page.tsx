import { HeaderSubPage } from "@/components/layouts/header-subpage";
import { PageLayout } from "@/components/layouts/page-layout";
import { _listCompanyActivities } from "@/features/activities/actions/_listCompanyActivities";
import { CompanyActivities } from "@/features/activities/components/company-activities";
import { _getCompany } from "@/features/companies/actions/_getCompany";
import { CompanySidebar } from "@/features/companies/components/company-sidebar";
import { listTags } from "@/features/tags/actions/listTags";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { redirect } from "next/navigation";

type Props = {
  params: {
    slug: string;
    companyId: string;
  };
};

export default async function Page({ params: { companyId, slug } }: Props) {
  const rCompany = await _getCompany({ id: companyId });
  const rActivities = await _listCompanyActivities({
    company_id: companyId,
    page: 1,
  });
  const rTags = await listTags();

  const company = rCompany?.data;
  const tags = rTags?.data;
  const activities = rActivities?.data;

  if (!company) redirect(`/${slug}/companies`);

  return (
    <PageLayout>
      <HeaderSubPage title="Companies" currentPage={company.name ?? ""} />
      <div className="flex divide-x h-full overflow-hidden">
        <ScrollArea className="flex-1">
          {activities && (
            <CompanyActivities
              company_id={companyId}
              initialActivities={activities}
              className="px-8"
            />
          )}
        </ScrollArea>
        <CompanySidebar company={company} tags={tags} />
      </div>
    </PageLayout>
  );
}
