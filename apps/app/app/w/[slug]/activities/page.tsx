import { ScrollArea } from "@conquest/ui/scroll-area";
import { GroupedActivities } from "features/activities/grouped-activities";
import { listActivities } from "queries/activities/listActivities";

export default async function Page() {
  const rActivities = await listActivities({});
  const activities = rActivities?.data ?? [];

  return (
    <div className="flex h-full flex-col divide-y">
      <div className="flex min-h-12 shrink-0 items-center px-4">
        <p className="font-medium text-base">Activities</p>
      </div>
      <ScrollArea>
        <div className="mx-auto max-w-3xl py-12">
          <GroupedActivities activities={activities} />
        </div>
      </ScrollArea>
    </div>
  );
}
