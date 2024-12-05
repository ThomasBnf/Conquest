import { DateRangePicker } from "@/components/custom/date-range-picker";
import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { LeaderbordTable } from "@/features/leaderbord/leaderboard-table";
import { Podium } from "@/features/leaderbord/podium";
import { listLeaderboard } from "@/queries/leaderboard/listLeaderboard";
import { listTags } from "@/queries/tags/listTags";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { searchParamsDate } from "lib/searchParamsDate";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  const { from, to } = searchParamsDate.parse(searchParams);

  const user = await getCurrentUser();
  const workspace_id = user.workspace_id;

  const members = await listLeaderboard({ page: 1, from, to, workspace_id });
  const tags = await listTags({ workspace_id });

  return (
    <PageLayout>
      <Header title="Leaderboard" className="justify-between">
        <DateRangePicker />
      </Header>
      {members?.length > 0 && (
        <div className="grid grid-cols-3 gap-4 border-b p-4">
          {members?.slice(0, 3).map((member, position) => (
            <Podium key={member.id} member={member} position={position} />
          ))}
        </div>
      )}
      <LeaderbordTable
        initialMembers={members.slice(3)}
        tags={tags}
        from={from}
        to={to}
      />
    </PageLayout>
  );
}
