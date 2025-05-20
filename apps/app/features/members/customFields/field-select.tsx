import { Workspace } from "@conquest/db/prisma";
import { Input } from "@conquest/ui/input";
import {
  CustomField,
  CustomFieldSelect,
} from "@conquest/zod/schemas/custom-fields.schema";
import { useState } from "react";
import { useUpdateMember } from "../mutations/useUpdateMember";

type Props = {
  field: CustomFieldSelect;
  workspace: Workspace;
};

export const FieldSelect = ({ field, workspace }: Props) => {
  const [value, setValue] = useState(field.value);
  const { customFields } = workspace;

  const updateMember = useUpdateMember();

  const updateFieldValue = (field: CustomField, newValue: string) => {
    // if (newValue === "") {
    //   setValue(field.value as string);
    //   return;
    // }
    // updateMember({
    //   ...member,
    //   customFields: {
    //     ...customFields,
    //     fields: customFields.fields.map((f) =>
    //       f.id === field.id ? { ...f, value: newValue } : f,
    //     ),
    //   },
    // });
  };

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={(e) => updateFieldValue(field, e.target.value)}
    />
  );
};
