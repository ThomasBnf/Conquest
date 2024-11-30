import { useQuery } from "@tanstack/react-query";
import { listActivityTypes } from "../actions/listActivityTypes";

export const useListActivityTypes = () => {
  const query = useQuery({
    queryKey: ["activity-types"],
    queryFn: async () => {
      const rActivityTypes = await listActivityTypes();
      return rActivityTypes?.data;
    },
  });

  return query;
};
