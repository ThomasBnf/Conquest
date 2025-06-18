import { Workflows } from "@conquest/ui/icons/Workflows";
import { AddWorkflow } from "./add-workflow";

type Props = {
  slug: string;
};

export const EmptyWorkflows = ({ slug }: Props) => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <Workflows />
      <div className="mt-2 mb-4">
        <p className="font-medium text-base">No workflows found</p>
        <p className="text-muted-foreground">
          You don't have any workflows yet in workspace.
        </p>
      </div>
      <AddWorkflow slug={slug} />
    </div>
  );
};
