import { ScrollArea } from "@conquest/ui/scroll-area";
import { GroupedActivities } from "features/activities/grouped-activities";

export default function Page() {
  return (
    <div className="flex h-full flex-col divide-y">
      <div className="flex min-h-12 shrink-0 items-center px-4">
        <p className="font-medium text-base">Activities</p>
      </div>
      <ScrollArea>
        <div className="mx-auto max-w-3xl py-12">
          <GroupedActivities />
        </div>
      </ScrollArea>
    </div>
  );
}
