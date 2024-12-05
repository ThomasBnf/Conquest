import { listActivitiesType } from "@/actions/activity-types/listActivitiesType";
import { ActivityType } from "@/features/activities-types/activity-type";
import { CreateActivityType } from "@/features/activities-types/create-activity-type";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";

export default async function Page() {
  const rActivitiesTypes = await listActivitiesType();
  const activitiesTypes = rActivitiesTypes?.data;

  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-3xl flex-col py-24">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-medium text-2xl">Activities Types</p>
            <p className="text-muted-foreground">Manage activities types</p>
          </div>
          <CreateActivityType />
        </div>
        <Separator className="my-4" />
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="w-52 text-muted-foreground">Name</p>
            <p className="w-32 text-muted-foreground">Source</p>
            <p className="flex-1 text-muted-foreground">Key</p>
            <p className="w-28 text-muted-foreground">Weight</p>
            <div className="w-6" />
          </div>
          {activitiesTypes?.map((activityType) => (
            <ActivityType key={activityType.id} activityType={activityType} />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
