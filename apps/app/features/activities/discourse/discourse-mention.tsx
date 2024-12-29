import { useUser } from "@/context/userContext";
import { useGetMember } from "@/queries/hooks/useGetMember";
import Link from "next/link";

type Props = {
  username: string;
};

export const DiscourseMention = ({ username }: Props) => {
  const { slug } = useUser();
  const { data: member } = useGetMember({ username });
  const { id, first_name, last_name } = member ?? {};

  return (
    <Link
      href={`/${slug}/members/${id}/analytics`}
      className="cursor-pointer rounded-md bg-[#E5EFF5] p-0.5 px-1 text-[#1264a3]"
    >
      @{first_name} {last_name}
    </Link>
  );
};
