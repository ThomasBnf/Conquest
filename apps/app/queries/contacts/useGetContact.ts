import { getContact } from "@/actions/contacts/getContact";
import { useQuery } from "@tanstack/react-query";

type Props = {
  slack_id: string;
};

export const useGetContact = ({ slack_id }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["contact", slack_id],
    queryFn: () => getContact({ slack_id }),
  });

  return { data: data?.data, isLoading };
};
