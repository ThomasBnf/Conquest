import type { Source } from "@conquest/zod/enum/source.enum";

type Props = {
  id: string;
  source: Source;
};

export const idParser = ({ id, source }: Props) => {
  switch (source) {
    case "SLACK":
      return { slack_id: id };
    case "DISCOURSE":
      return { discourse_id: id };
    case "LINKEDIN":
      return { linkedin_id: id };
    case "LIVESTORM":
      return { livestorm_id: id };
    default:
      return { id };
  }
};
