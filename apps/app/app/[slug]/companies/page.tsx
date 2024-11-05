import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { listCompanies } from "@/features/companies/actions/_listCompanies";
import { CompaniesTable } from "@/features/companies/components/companies-table";

export default async function Page() {
  const rCompanies = await listCompanies({ page: 1 });
  const companies = rCompanies?.data;

  return (
    <PageLayout>
      <Header title="Companies" className="justify-between" />
      {companies && <CompaniesTable initialCompanies={companies} />}
    </PageLayout>
  );
}
