import { useGetContact } from "@/queries/contacts/useGetContact";

export const SlackUser = ({ slack_id }: { slack_id: string }) => {
  const { data } = useGetContact({ slack_id });

  return (
    <span className="bg-muted p-1 min-h-6 w-92 rounded-md text-foreground leading-none">
      @{data?.full_name}
    </span>
  );
};
