import { useUser } from "@/context/userContext";
import { trpc } from "@/server/client";
import Link from "next/link";

type Props = {
  slackId: string;
};

export const SlackMention = ({ slackId }: Props) => {
  const { slug } = useUser();

  const { data: profile } = trpc.profiles.get.useQuery({
    external_id: slackId,
  });

  const { data: member } = trpc.members.get.useQuery({
    id: profile?.member_id ?? "",
  });

  const { first_name, last_name } = member ?? {};

  return (
    <Link
      href={`/${slug}/members/${member?.id}/analytics`}
      className="cursor-pointer rounded-md bg-[#E5EFF5] p-0.5 text-[#1264a3] transition-colors hover:bg-[#D1E6F0] hover:text-[#094C8C]"
    >
      @{first_name} {last_name}
    </Link>
  );
};
