import { ActivityWithMemberSchema } from "@conquest/zod/activity.schema";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";

type Props = {
  ts: string | undefined;
  type?: "MESSAGE";
};

export const useGetActivity = ({ ts, type }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["activity", ts],
    queryFn: () => ky.get(`/api/activities/${ts}`).json(),
  });

  if (!data) return { activity: undefined, isLoading };

  const activity = ActivityWithMemberSchema.parse(data);

  return { activity, isLoading };
};
