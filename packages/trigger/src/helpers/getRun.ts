import { runs } from "@trigger.dev/sdk/v3";

type Props = {
  runId: string | null;
};

export const getRun = async ({ runId }: Props) => {
  if (!runId) return null;

  return await runs.retrieve(runId);
};
