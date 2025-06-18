import { Workflows } from "@conquest/ui/icons/Workflows";

export const EmptyRuns = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <Workflows />
      <div className="mt-2 mb-4">
        <p className="font-medium text-base">No runs found</p>
        <p className="text-muted-foreground">This workflow has no runs yet.</p>
      </div>
    </div>
  );
};
