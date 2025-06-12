import { useWorkspace } from "@/hooks/useWorkspace";
import { trpc } from "@/server/client";
import Link from "next/link";

type Props = {
  slackId: string;
};

export const SlackMention = ({ slackId }: Props) => {
  const { slug } = useWorkspace();

  const { data: profile } = trpc.profiles.get.useQuery({
    externalId: slackId,
  });

  const { data: member } = trpc.members.get.useQuery({
    id: profile?.memberId ?? "",
  });

  const { firstName, lastName } = member ?? {};

  return (
    <Link
      href={`/${slug}/members/${member?.id}/analytics`}
      className="cursor-pointer rounded-md bg-[#E5EFF5] p-0.5 text-[#1264a3] transition-colors hover:bg-[#D1E6F0] hover:text-[#094C8C]"
    >
      @{firstName} {lastName}
    </Link>
  );
};
