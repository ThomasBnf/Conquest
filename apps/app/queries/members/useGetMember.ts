import { getMember } from "@/actions/members/getMember";
import { useQuery } from "@tanstack/react-query";

type Props = {
  slack_id: string;
};

export const useGetMember = ({ slack_id }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["member", slack_id],
    queryFn: () => getMember({ slack_id }),
  });

  return { data: data?.data, isLoading };
};
