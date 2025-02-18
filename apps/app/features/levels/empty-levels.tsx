import { CreateLevelDialog } from "./create-level-dialog";

export const EmptyLevels = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-md border bg-muted p-6">
      <div className="flex flex-col items-center">
        <p className="font-medium text-base">No levels found</p>
        <p className="text-muted-foreground">
          Create your first level to categorize your members
        </p>
      </div>
      <CreateLevelDialog />
    </div>
  );
};
