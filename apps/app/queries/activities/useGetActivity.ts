import { getActivity } from "@/actions/activities/getActivity";
import { useQuery } from "@tanstack/react-query";

type Props = {
  ts: string | undefined;
};

export const useGetActivity = ({ ts }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["activity", ts],
    queryFn: () => getActivity({ ts }),
  });

  return { data: data?.data, isLoading };
};
