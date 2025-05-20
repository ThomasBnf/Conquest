import { EditableDate } from "@/components/editable/editable-date";
import { Workspace } from "@conquest/db/prisma";
import { CustomFieldDate } from "@conquest/zod/schemas/custom-fields.schema";
import { useState } from "react";
import { useUpdateMember } from "../mutations/useUpdateMember";

type Props = {
  field: CustomFieldDate;
  workspace: Workspace;
};

export const FieldDate = ({ field, workspace }: Props) => {
  const [value, setValue] = useState(field.value);
  const { customFields } = workspace;

  const updateMember = useUpdateMember();

  const updateFieldValue = (newValue: Date) => {};

  return <EditableDate defaultValue={value} onUpdate={updateFieldValue} />;
};
