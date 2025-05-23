import { RunOverview } from "./run-overview";

type Props = {
  workflowId: string;
  children: React.ReactNode;
};

export const RunSidebar = ({ workflowId, children }: Props) => {
  return (
    <div className="flex h-full w-full max-w-sm flex-col divide-y border-l bg-background">
      {children}
      <RunOverview workflowId={workflowId} />
    </div>
  );
};
