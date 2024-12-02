import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { CreateMemberDialog } from "@/features/members/components/create-member-dialog";
import { MembersTable } from "@/features/members/components/table/members-table";
import { getCurrentUser } from "@/features/users/functions/getCurrentUser";
import { searchParamsTable } from "@/lib/searchParamsTable";
import { countMembers } from "@/queries/members/countMembers";
import { listMembers } from "@/queries/members/listMembers";
import { listTags } from "@/queries/tags/listTags";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  const { search, id, desc, page, pageSize } =
    searchParamsTable.parse(searchParams);

  const user = await getCurrentUser();
  const workspace_id = user.workspace_id;

  const members = await listMembers({
    search,
    id,
    desc,
    page,
    pageSize,
    workspace_id,
  });
  const count = await countMembers({ workspace_id });
  const tags = await listTags({ workspace_id });

  return (
    <PageLayout>
      <Header title="Members">
        <CreateMemberDialog />
      </Header>
      <MembersTable count={count} tags={tags} members={members} />
    </PageLayout>
  );
}
