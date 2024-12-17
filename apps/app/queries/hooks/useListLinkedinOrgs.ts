import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useListLinkedinOrgs = () => {
  return useQuery({
    queryKey: ["linkedinOrgs"],
    queryFn: async () => {
      const response = await client.api.linkedin["get-company"].$get();
      return await response.json();
    },
  });
};
