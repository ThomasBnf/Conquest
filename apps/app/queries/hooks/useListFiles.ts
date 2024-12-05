import { useUser } from "@/context/userContext";
import { client } from "@/lib/rpc";
import { FileWithTypeSchema } from "@conquest/zod/schemas/file.schema";
import { useQuery } from "@tanstack/react-query";

type Props = {
  activityId: string;
};

export const useListFiles = ({ activityId }: Props) => {
  const { slack } = useUser();

  return useQuery({
    queryKey: ["files", activityId],
    queryFn: async () => {
      const reponse = await client.api.files[":activityId"].$get({
        param: {
          token: slack?.details.token ?? "",
        },
      });

      return FileWithTypeSchema.array().parse(await reponse.json());
    },
    enabled: !!slack?.details.token,
  });
};
