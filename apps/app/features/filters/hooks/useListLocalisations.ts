import { useQuery } from "@tanstack/react-query";
import { listLocalisations } from "../actions/listLocalisations";

export const useListLocalisations = () => {
  const query = useQuery({
    queryKey: ["localisations"],
    queryFn: async () => {
      const rLocalisations = await listLocalisations();
      return rLocalisations?.data;
    },
  });

  return {
    ...query,
    localisations: query.data,
  };
};
