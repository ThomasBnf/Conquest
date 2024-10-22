import { searchParamsMembers } from "@/lib/searchParamsMembers";
import { MembersTable } from "features/members/table/members-table";
import { countMembers } from "queries/members/countMembers";
import { listTags } from "queries/tags/listTags";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  searchParamsMembers.parse(searchParams);

  const rTags = await listTags();
  const tags = rTags?.data;

  const rCountMembers = await countMembers();
  const count = rCountMembers?.data ?? 0;

  return <MembersTable tags={tags} membersCount={count} />;
}
