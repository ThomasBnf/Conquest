import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { CompaniesTable } from "@/features/companies/companies-table";
import { CreateCompanyDialog } from "@/features/companies/create-company-dialog";
import { searchParamsTable } from "@/lib/searchParamsTable";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { listTags } from "@conquest/db/queries/tags/listTags";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  searchParamsTable.parse(searchParams);

  const user = await getCurrentUser();
  const workspace_id = user.workspace_id;

  const tags = await listTags({ workspace_id });

  return (
    <PageLayout>
      <Header title="Companies">
        <CreateCompanyDialog />
      </Header>
      <CompaniesTable tags={tags} />
    </PageLayout>
  );
}
