import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { MemberDialog } from "@/features/members/components/member-dialog";
import { MembersTable } from "@/features/members/components/table/members-table";
import { searchParamsTable } from "@/lib/searchParamsTable";
import { listTags } from "@/queries/tags/listTags";
import { getCurrentUser } from "@/queries/users/getCurrentUser";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  searchParamsTable.parse(searchParams);

  const user = await getCurrentUser();
  const workspace_id = user.workspace_id;

  const tags = await listTags({ workspace_id });

  return (
    <PageLayout>
      <Header title="Members">
        <MemberDialog />
      </Header>
      <MembersTable tags={tags} />
    </PageLayout>
  );
}
