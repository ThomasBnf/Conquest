import { useGetContact } from "@/queries/contacts/useGetContact";

export const SlackUser = ({ slack_id }: { slack_id: string }) => {
  const { data } = useGetContact({ slack_id });
  return (
    <span className="bg-muted p-1 rounded-md text-foreground">
      @{data?.full_name}
    </span>
  );
};
