import { NodeWait } from "@conquest/zod/schemas/node.schema";
import { wait } from "@trigger.dev/sdk/v3";

type Props = {
  node: NodeWait;
};

export const waitFor = async ({ node }: Props) => {
  const { duration, unit } = node;

  const timeMap = {
    seconds: 1,
    minutes: 60,
    hours: 60 * 60,
    days: 24 * 60 * 60,
  } as const;

  const milliseconds = duration * timeMap[unit];
  await wait.for({ seconds: milliseconds });
};
