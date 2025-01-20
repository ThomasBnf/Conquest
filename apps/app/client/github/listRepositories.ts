import { client } from "@/lib/rpc";
import { GithubRepositorySchema } from "@conquest/zod/types/github";
import { useQuery } from "@tanstack/react-query";

export const listRepositories = () => {
  const query = useQuery({
    queryKey: ["github", "repositories"],
    queryFn: async () => {
      const response = await client.api.github.$get();
      return GithubRepositorySchema.array().parse(await response.json());
    },
  });

  return {
    ...query,
    repositories: query.data,
  };
};
