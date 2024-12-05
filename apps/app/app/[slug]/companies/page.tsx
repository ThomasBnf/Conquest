import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { CompaniesTable } from "@/features/companies/companies-table";
import { searchParamsTable } from "@/lib/searchParamsTable";
import { countCompanies } from "@/queries/companies/countCompanies";
import { listCompanies } from "@/queries/companies/listCompanies";
import { listTags } from "@/queries/tags/listTags";
import { getCurrentUser } from "@/queries/users/getCurrentUser";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  const { search, id, desc, page, pageSize } =
    searchParamsTable.parse(searchParams);

  const user = await getCurrentUser();
  const workspace_id = user.workspace_id;

  const companies = await listCompanies({
    search,
    id,
    desc,
    page,
    pageSize,
    workspace_id,
  });
  const count = await countCompanies({ workspace_id });
  const tags = await listTags({ workspace_id });

  return (
    <PageLayout>
      <Header title="Companies" className="justify-between" />
      {companies && <CompaniesTable companies={companies} count={count} />}
    </PageLayout>
  );
}
