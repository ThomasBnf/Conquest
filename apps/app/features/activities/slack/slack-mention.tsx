import { useGetMember } from "@/queries/members/useGetMember";

type Props = {
  slack_id: string;
};

export const SlackMention = ({ slack_id }: Props) => {
  const { data } = useGetMember({ slack_id });
  const { full_name } = data ?? {};

  return (
    <span
      key={slack_id}
      className="bg-[#ffc6002e] text-[#1264a3] rounded p-0.5 px-1"
    >
      @{full_name}
    </span>
  );
};
