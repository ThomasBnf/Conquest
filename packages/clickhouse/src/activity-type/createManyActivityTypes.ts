import type { Source } from "@conquest/zod/enum/source.enum";
import type { ActivityTypeRule } from "@conquest/zod/schemas/activity-type.schema";
import { v4 as uuid } from "uuid";
import { client } from "../client";

type Props = {
  activityTypes: {
    name: string;
    source: Source;
    key: string;
    points: number;
    conditions: {
      rules: ActivityTypeRule[];
    };
    deletable: boolean;
  }[];
  workspaceId: string;
};

export const createManyActivityTypes = async (props: Props) => {
  const { activityTypes, workspaceId } = props;

  const values = activityTypes.map(({ ...rest }) => ({
    id: uuid(),
    ...rest,
    workspaceId,
  }));

  return await client.insert({
    table: "activityType",
    values,
    format: "JSON",
  });
};
