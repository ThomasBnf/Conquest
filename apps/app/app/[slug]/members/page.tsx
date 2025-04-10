import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { CreateMemberDialog } from "@/features/members/create-member-dialog";
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
        <CreateMemberDialog />
      </Header>
      <MembersPage />
    </PageLayout>
  );
}
