import Discourse from "discourse2";

type Props = {
  communityUrl: string;
  apiKey: string;
};

export const discourseClient = ({ communityUrl, apiKey }: Props) => {
  return new Discourse(communityUrl, {
    "Api-Key": apiKey,
    "Api-Username": "system",
  });
};
