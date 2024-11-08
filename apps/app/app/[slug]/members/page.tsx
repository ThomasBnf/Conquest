import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { _listMembers } from "@/features/members/actions/_listMembers";
import { CreateMemberDialog } from "@/features/members/components/create-member-dialog";
import { MembersTable } from "@/features/members/components/table/members-table";
import { countMembers } from "@/features/members/functions/countMembers";
import { listTags } from "@/features/tags/functions/listTags";

type Props = {
  searchParams: {
    search: string;
  };
};

export default async function Page({ searchParams: { search } }: Props) {
  const rInitialMembers = await _listMembers({
    search: search ?? "",
    page: 1,
    id: "full_name",
    desc: false,
  });
  const rCountMembers = await countMembers();
  const rTags = await listTags();

  const initialMembers = rInitialMembers?.data;
  const tags = rTags?.data;
  const count = rCountMembers?.data ?? 0;

  return (
    <PageLayout>
      <Header title="Members">
        <CreateMemberDialog />
      </Header>
      <MembersTable initialMembers={initialMembers} count={count} tags={tags} />
    </PageLayout>
  );
}
