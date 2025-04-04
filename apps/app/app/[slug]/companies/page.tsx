import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { CompaniesPage } from "@/features/companies/companies-page";
import { CreateCompanyDialog } from "@/features/companies/create-company-dialog";
import { loaderTableCompanies } from "@/utils/tableParams";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: Props) {
  await loaderTableCompanies(searchParams);

  return (
    <PageLayout>
      <Header title="Companies">
        <CreateCompanyDialog />
      </Header>
      <CompaniesPage />
    </PageLayout>
  );
}
