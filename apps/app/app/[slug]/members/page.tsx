import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { CreateMemberDialog } from "@/features/members/create-member-dialog";
import { MembersTable } from "@/features/members/members-table";
import { countMembers } from "@/features/members/queries/countMembers";
import { listTags } from "@/features/tags/queries/listTags";
import { searchParamsMembers } from "@/lib/searchParamsMembers";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  searchParamsMembers.parse(searchParams);

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
