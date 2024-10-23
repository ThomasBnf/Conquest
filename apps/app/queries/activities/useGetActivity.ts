import { getActivity } from "@/actions/activities/getActivity";
import { useQuery } from "@tanstack/react-query";

type Props = {
  ts: string | undefined;
  type?: "MESSAGE";
};

export const useGetActivity = ({ ts, type }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["activity", ts],
    queryFn: () => getActivity({ ts, type }),
  });

  return { data: data?.data, isLoading };
};
