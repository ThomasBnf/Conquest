import { Duplicate } from "@conquest/ui/icons/Duplicate";

export const EmptyDuplicates = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <Duplicate />
      <div className="mt-2 mb-4">
        <p className="font-medium text-base">No duplicates found</p>
        <p className="text-muted-foreground text-sm">
          You don't have any duplicates yet in workspace.
        </p>
      </div>
    </div>
  );
};
