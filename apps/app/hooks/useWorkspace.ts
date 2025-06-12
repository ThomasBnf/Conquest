import { trpc } from "@/server/client";

export const useWorkspace = () => {
  const { data: workspace } = trpc.workspaces.get.useQuery();

  return { workspace, slug: workspace?.slug };
};
