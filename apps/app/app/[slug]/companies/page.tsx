import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { CompaniesProvider } from "@/context/companiesContext";
import { CompaniesPage } from "@/features/companies/companies-page";
import { CreateCompanyDialog } from "@/features/companies/create-company-dialog";
import { loaderTable } from "@/lib/searchParamsTable";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: Props) {
  await loaderTable(searchParams);

  return (
    <PageLayout>
      <Header title="Companies">
        <CreateCompanyDialog />
      </Header>
      <CompaniesProvider>
        <CompaniesPage />
      </CompaniesProvider>
    </PageLayout>
  );
}
