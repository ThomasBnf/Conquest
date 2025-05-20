import { useUpdateWorkspace } from "@/features/workspaces/mutations/useUpdateWorkspace";
import { Workspace } from "@conquest/db/prisma";
import { Badge } from "@conquest/ui/badge";
import {
  CustomField,
  CustomFieldMultiSelect,
} from "@conquest/zod/schemas/custom-fields.schema";
import { useState } from "react";

type Props = {
  field: CustomFieldMultiSelect;
  workspace: Workspace;
};

export const FieldMultiSelect = ({ field, workspace }: Props) => {
  const [values, setValues] = useState<string[]>(field.values);
  const { customFields } = workspace;

  const updateWorkspace = useUpdateWorkspace();

  const updateFieldValue = (field: CustomField, newValue: string[]) => {
    // updateWorkspace({
    //   ...workspace,
    //   customFields: customFields.map((f) =>
    //     f.id === field.id ? { ...f, values: newValue } : f,
    //   ),
    // });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <Badge key={value}>{value}</Badge>
      ))}
    </div>
  );
};
