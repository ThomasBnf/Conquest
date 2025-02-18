import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { CompaniesProvider } from "@/context/companiesContext";
import { FiltersProvider } from "@/context/filtersContext";
import { CompaniesPage } from "@/features/companies/companies-page";
import { CreateCompanyDialog } from "@/features/companies/create-company-dialog";
import { searchParamsTable } from "@/lib/searchParamsTable";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function Page({ searchParams }: Props) {
  searchParamsTable.parse(searchParams);

  return (
    <PageLayout>
      <Header title="Companies">
        <CreateCompanyDialog />
      </Header>
      <FiltersProvider>
        <CompaniesProvider>
          <CompaniesPage />
        </CompaniesProvider>
      </FiltersProvider>
    </PageLayout>
  );
}
