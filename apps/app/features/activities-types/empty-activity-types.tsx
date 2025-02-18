import { CreateActivityTypeDialog } from "./create-activity-type-dialog";

export const EmptyActivityTypes = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-md border bg-muted px-6 py-12">
      <div className="flex flex-col items-center">
        <p className="font-medium text-base">No activity types found</p>
        <p className="text-muted-foreground">
          Create your first activity type to categorize your members
        </p>
      </div>
      <CreateActivityTypeDialog />
    </div>
  );
};
