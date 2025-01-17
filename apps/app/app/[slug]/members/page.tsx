import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { MemberDialog } from "@/features/members/member-dialog";
import { Table } from "@/features/members/table";
import { searchParamsTable } from "@/lib/searchParamsTable";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  searchParamsTable.parse(searchParams);

  return (
    <PageLayout>
      <Header title="Members">
        <MemberDialog />
      </Header>
      <Table />
    </PageLayout>
  );
}
