import { client } from "@/lib/rpc";
import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";
import { useQuery } from "@tanstack/react-query";

type Props = {
  workflow_id: string;
};

export const useGetWorkflow = ({ workflow_id }: Props) => {
  return useQuery({
    queryKey: ["workflow", workflow_id],
    queryFn: async () => {
      const response = await client.api.workflows.$get({
        query: { workflow_id },
      });
      return WorkflowSchema.parse(await response.json());
    },
  });
};
