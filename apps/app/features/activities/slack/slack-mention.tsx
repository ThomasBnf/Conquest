import { useUser } from "@/context/userContext";
import { useGetMember } from "@/queries/members/useGetMember";
import Link from "next/link";

type Props = {
  slack_id: string;
};

export const SlackMention = ({ slack_id }: Props) => {
  const { slug } = useUser();
  const { data } = useGetMember({ slack_id });
  const { id, full_name } = data ?? {};

  return (
    <Link
      href={`/w/${slug}/members/${id}`}
      className="bg-[#ffc6002e] text-[#1264a3] rounded p-0.5 px-1 cursor-pointer"
    >
      @{full_name}
    </Link>
  );
};
