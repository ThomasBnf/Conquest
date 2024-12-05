import { useUser } from "@/context/userContext";
import { useGetSlackMember } from "@/queries/hooks/useGetSlackMember";
import Link from "next/link";

type Props = {
  slack_id: string;
};

export const SlackMention = ({ slack_id }: Props) => {
  const { slug } = useUser();
  const { data: member } = useGetSlackMember({ id: slack_id });
  const { id, first_name, last_name } = member ?? {};

  return (
    <Link
      href={`/${slug}/members/${id}`}
      className="cursor-pointer rounded-md bg-[#E5EFF5] p-0.5 px-1 text-[#1264a3]"
    >
      @{first_name} {last_name}
    </Link>
  );
};
