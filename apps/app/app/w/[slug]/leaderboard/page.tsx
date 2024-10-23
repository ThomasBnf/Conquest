import { listLeaderboard } from "@/actions/members/listLeaderboard";
import { listTags } from "@/actions/tags/listTags";
import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { LeaderbordTable } from "@/features/leaderbord/leaderboard-table";
import { Podium } from "@/features/leaderbord/podium";
import { DateRangePicker } from "features/dashboard/date-range-picker";
import { searchParamsDate } from "lib/searchParamsDate";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  const { from, to } = searchParamsDate.parse(searchParams);

  const rMembers = await listLeaderboard({ page: 0, from, to });
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
      <LeaderbordTable tags={tags} from={from} to={to} />
    </PageLayout>
  );
}
