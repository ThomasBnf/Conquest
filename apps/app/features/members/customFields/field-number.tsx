import { Workspace } from "@conquest/db/prisma";
import { CustomFieldNumber } from "@conquest/zod/schemas/custom-fields.schema";
import { useState } from "react";
import { useUpdateMember } from "../mutations/useUpdateMember";

type Props = {
  field: CustomFieldNumber;
  workspace: Workspace;
};

export const FieldNumber = ({ field, workspace }: Props) => {
  const [value, setValue] = useState(field.value);
  const { customFields } = workspace;

  const updateMember = useUpdateMember();

  const updateFieldValue = (newValue: number) => {};

  return <div>{value}</div>;
};
