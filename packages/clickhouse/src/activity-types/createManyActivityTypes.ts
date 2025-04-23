import type { Source } from "@conquest/zod/enum/source.enum";
import type { ActivityTypeRule } from "@conquest/zod/schemas/activity-type.schema";
import { v4 as uuid } from "uuid";
import { client } from "../client";

type Props = {
  activity_types: {
    name: string;
    source: Source;
    key: string;
    points: number;
    conditions: {
      rules: ActivityTypeRule[];
    };
    deletable: boolean;
  }[];
  workspace_id: string;
};

export const createManyActivityTypes = async (props: Props) => {
  const { activity_types, workspace_id } = props;

  const values = activity_types.map(({ ...rest }) => ({
    id: uuid(),
    ...rest,
    workspace_id,
  }));

  return await client.insert({
    table: "activity_type",
    values,
    format: "JSON",
  });
};
