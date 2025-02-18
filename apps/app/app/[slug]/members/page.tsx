import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { FiltersProvider } from "@/context/filtersContext";
import { MembersProvider } from "@/context/membersContext";
import { CreateMemberDialog } from "@/features/members/create-member-dialog";
import { MembersPage } from "@/features/members/members-page";
import { searchParamsTable } from "@/lib/searchParamsTable";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function Page({ searchParams }: Props) {
  searchParamsTable.parse(searchParams);

  return (
    <PageLayout>
      <Header title="Members">
        <CreateMemberDialog />
      </Header>
      <FiltersProvider>
        <MembersProvider>
          <MembersPage />
        </MembersProvider>
      </FiltersProvider>
    </PageLayout>
  );
}
