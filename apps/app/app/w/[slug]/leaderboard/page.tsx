import { listPodium } from "actions/contacts/listPodium";
import { DateRangePicker } from "features/dashboard/date-range-picker";
import { LeaderbordTable } from "features/leaderbord/leaderboard-table";
import { Podium } from "features/leaderbord/podium";
import { searchParamsDate } from "lib/searchParamsDate";
import { listTags } from "queries/tags/listTags";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  const { from, to } = searchParamsDate.parse(searchParams);

  const rContacts = await listPodium({ from, to });
  const contacts = rContacts?.data;

  const podium = contacts?.slice(0, 3);

  const rTags = await listTags();
  const tags = rTags?.data;

  return (
    <div className="flex h-full flex-col divide-y">
      <div className="flex min-h-12 shrink-0 items-center justify-between px-4">
        <p className="font-medium text-base">Leaderbord</p>
        <DateRangePicker />
      </div>
      <div className="grid shrink-0 grid-cols-3 gap-4 p-4">
        {podium?.map((contact, position) => (
          <Podium key={contact.id} contact={contact} position={position} />
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        <LeaderbordTable tags={tags} from={from} to={to} />
      </div>
    </div>
  );
}
