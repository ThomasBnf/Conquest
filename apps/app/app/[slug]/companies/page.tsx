import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { _listCompanies } from "@/features/companies/actions/_listCompanies";
import { CompaniesTable } from "@/features/companies/components/table/companies-table";
import { countCompanies } from "@/features/companies/functions/countCompanies";

export default async function Page() {
  const rCompanies = await _listCompanies({
    page: 1,
    name: "",
    id: "name",
    desc: false,
  });
  const rCountCompanies = await countCompanies();

  const companies = rCompanies?.data;
  const count = rCountCompanies?.data ?? 0;

  return (
    <PageLayout>
      <Header title="Companies" className="justify-between" />
      {companies && (
        <CompaniesTable initialCompanies={companies} count={count} />
      )}
    </PageLayout>
  );
}
