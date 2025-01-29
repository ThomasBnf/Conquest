import Discourse from "discourse2";

type Props = {
  community_url: string;
  api_key: string;
};

export const discourseClient = ({ community_url, api_key }: Props) => {
  return new Discourse(community_url, {
    "Api-Key": api_key,
    "Api-Username": "system",
  });
};
