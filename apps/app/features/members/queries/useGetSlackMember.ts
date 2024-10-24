import { MemberSchema } from "@conquest/zod/member.schema";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
type Props = {
  id: string;
};

export const useGetSlackMember = ({ id }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["member", id],
    queryFn: () => ky.get(`/api/members/slack/${id}`).json(),
  });

  if (!data) return { member: undefined, isLoading };

  const member = MemberSchema.parse(data);

  return { member, isLoading };
};
