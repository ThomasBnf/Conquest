import { countMembers } from "@/actions/members/countMembers";
import { listTags } from "@/actions/tags/listTags";
import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { AddMember } from "@/features/members/add-member";
import { searchParamsMembers } from "@/lib/searchParamsMembers";
import { MembersTable } from "features/members/table/members-table";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  searchParamsMembers.parse(searchParams);

  const rCountMembers = await countMembers();
  const rTags = await listTags();

  const count = rCountMembers?.data ?? 0;
  const tags = rTags?.data;

  return (
    <PageLayout>
      <Header title="Members" className="justify-between" count={count}>
        <AddMember />
      </Header>
      <MembersTable tags={tags} />
    </PageLayout>
  );
}
