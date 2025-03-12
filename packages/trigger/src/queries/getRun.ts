import { runs } from "@trigger.dev/sdk/v3";

type Props = {
  run_id: string;
};

export const getRun = async ({ run_id }: Props) => {
  return await runs.retrieve(run_id);
};
