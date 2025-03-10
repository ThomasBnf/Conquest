import { CompanyPage } from "@/features/companies/company-page";

type Props = {
  params: Promise<{
    companyId: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { companyId } = await params;

  return <CompanyPage companyId={companyId} />;
}
