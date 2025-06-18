import { trpc } from "@/server/client";

export const useWorkspace = () => {
  const { data: workspace, isLoading } = trpc.workspaces.get.useQuery();

  return { workspace, isLoading, slug: workspace?.slug };
};
