import type { SOURCE } from "@conquest/database/src";

type Props = {
  source?: SOURCE;
  id: string | undefined;
};

export const idParser = ({ source, id }: Props) => {
  switch (source) {
    case "SLACK":
      return { slack_id: id };
    case "DISCOURSE":
      return { discourse_id: id };
    default:
      return { id };
  }
};
