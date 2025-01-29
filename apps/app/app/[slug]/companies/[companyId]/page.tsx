import { HeaderSubPage } from "@/components/layouts/header-subpage";
import { PageLayout } from "@/components/layouts/page-layout";
import { CompanyActivities } from "@/features/activities/company-activities";
import { CompanySidebar } from "@/features/companies/company-sidebar";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { listCompanyActivities } from "@conquest/db/queries/activities/listCompanyActivities";
import { getCompanyWithMembers } from "@conquest/db/queries/companies/getCompany";
import { listTags } from "@conquest/db/queries/tags/listTags";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { redirect } from "next/navigation";

type Props = {
  params: {
    slug: string;
    companyId: string;
  };
};

export default async function Page({ params: { companyId, slug } }: Props) {
  const user = await getCurrentUser();
  const workspace_id = user.workspace_id;

  const company = await getCompanyWithMembers({
    company_id: companyId,
    workspace_id,
  });

  if (!company) redirect(`/${slug}/companies`);

  const activities = await listCompanyActivities({
    company_id: company.id,
    workspace_id,
    page: 1,
  });
  const tags = await listTags({ workspace_id });

  return (
    <PageLayout className="m-1 rounded-lg border">
      <HeaderSubPage />
      <div className="flex h-full divide-x overflow-hidden">
        <ScrollArea className="flex-1">
          <CompanyActivities
            company_id={companyId}
            initialActivities={activities}
          />
        </ScrollArea>
        <CompanySidebar company={company} tags={tags} />
      </div>
    </PageLayout>
  );
}
