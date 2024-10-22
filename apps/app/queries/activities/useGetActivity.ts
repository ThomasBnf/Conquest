import { getActivity } from "@/actions/activities/getActivity";
import { useQuery } from "@tanstack/react-query";

type Props = {
  id: string | undefined;
};

export const useGetActivity = ({ id }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["activity", id],
    queryFn: () => getActivity({ id }),
  });

  return { data: data?.data, isLoading };
};
