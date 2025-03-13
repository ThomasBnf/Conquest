import { runs } from "@trigger.dev/sdk/v3";

type Props = {
  run_id: string | null;
};

export const getRun = async ({ run_id }: Props) => {
  if (!run_id) return null;

  return await runs.retrieve(run_id);
};
