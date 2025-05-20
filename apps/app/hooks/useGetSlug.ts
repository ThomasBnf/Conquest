import { trpc } from "@/server/client";

export const useGetSlug = () => {
  const { data: workspace } = trpc.workspaces.get.useQuery();

  return workspace?.slug;
};
