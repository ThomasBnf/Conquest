import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { DuplicatesButton } from "@/features/duplicates/duplicates-button";
import { AddMemberDialog } from "@/features/members/add-member-dialog";
import { MembersPage } from "@/features/members/members-page";
import { loaderTableMembers } from "@/utils/tableParams";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: Props) {
  await loaderTableMembers(searchParams);

  return (
    <PageLayout>
      <Header title="Members">
        <div className="flex items-center gap-2">
          <DuplicatesButton />
          <AddMemberDialog />
        </div>
      </Header>
      <MembersPage />
    </PageLayout>
  );
}
