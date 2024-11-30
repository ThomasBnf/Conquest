import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { CreateMemberDialog } from "@/features/members/components/create-member-dialog";
import { MembersTable } from "@/features/members/components/table/members-table";
import { countMembers } from "@/features/members/functions/countMembers";
import { _listTags } from "@/features/tags/actions/listTags";

export default async function Page() {
  const rCountMembers = await countMembers();
  const rTags = await _listTags();

  const tags = rTags?.data;
  const count = rCountMembers?.data ?? 0;

  return (
    <PageLayout>
      <Header title="Members">
        <CreateMemberDialog />
      </Header>
      <MembersTable count={count} tags={tags} />
    </PageLayout>
  );
}
