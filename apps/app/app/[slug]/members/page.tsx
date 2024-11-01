import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { CreateMemberDialog } from "@/features/members/components/create-member-dialog";
import { MembersTable } from "@/features/members/components/members-table";
import { countMembers } from "@/features/members/functions/countMembers";
import { listTags } from "@/features/tags/queries/listTags";

export default async function Page() {
  const rCountMembers = await countMembers();
  const rTags = await listTags();

  const tags = rTags?.data;
  const count = rCountMembers?.data ?? 0;

  return (
    <PageLayout>
      <Header title="Members" className="justify-between" count={count}>
        <CreateMemberDialog />
      </Header>
      <MembersTable tags={tags} />
    </PageLayout>
  );
}
