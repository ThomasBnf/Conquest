import { useUser } from "@/context/userContext";
import { useGetSlackMember } from "@/features/members/queries/useGetSlackMember";
import Link from "next/link";

type Props = {
  slack_id: string;
};

export const SlackMention = ({ slack_id }: Props) => {
  const { slug } = useUser();
  const { member } = useGetSlackMember({ id: slack_id });
  const { id, full_name } = member ?? {};

  return (
    <Link
      href={`/${slug}/members/${id}`}
      className="bg-[#ffc6002e] text-[#1264a3] rounded p-0.5 px-1 cursor-pointer"
    >
      @{full_name}
    </Link>
  );
};
