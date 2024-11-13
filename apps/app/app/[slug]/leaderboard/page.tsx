import { DateRangePicker } from "@/components/custom/date-range-picker";
import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { _listLeaderboard } from "@/features/leaderbord/actions/_listLeaderboard";
import { LeaderbordTable } from "@/features/leaderbord/components/leaderboard-table";
import { Podium } from "@/features/leaderbord/components/podium";
import { listTags } from "@/features/tags/actions/listTags";
import { searchParamsDate } from "lib/searchParamsDate";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  const { from, to } = searchParamsDate.parse(searchParams);

  const rMembers = await _listLeaderboard({ page: 1, from, to });
  const rTags = await listTags();

  const members = rMembers?.data;
  const tags = rTags?.data;

  return (
    <PageLayout>
      <Header title="Leaderboard" className="justify-between">
        <DateRangePicker />
      </Header>
      <div className="grid grid-cols-3 gap-4 p-4 border-b">
        {members?.slice(0, 3).map((member, position) => (
          <Podium key={member.id} member={member} position={position} />
        ))}
      </div>
      <LeaderbordTable
        initialMembers={members}
        tags={tags}
        from={from}
        to={to}
      />
    </PageLayout>
  );
}
