import { EditableInput } from "@/components/editable/editable-input";
import { CustomFieldText } from "@conquest/zod/schemas/custom-fields.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import { useUpdateMember } from "../mutations/useUpdateMember";

type Props = {
  field: CustomFieldText;
  member: Member;
};

export const FieldText = ({ field, member }: Props) => {
  const { customFields } = member;
  const value = customFields?.fields?.find((f) => f.id === field.id)?.value;

  const updateMember = useUpdateMember();

  const updateFieldValue = async (newValue: string) => {
    if (!customFields?.fields) {
      return await updateMember({
        ...member,
        customFields: {
          fields: [{ id: field.id, value: newValue }],
        },
      });
    }

    const existingField = customFields.fields.find((f) => f.id === field.id);

    if (existingField) {
      return await updateMember({
        ...member,
        customFields: {
          ...customFields,
          fields: customFields.fields.map((f) =>
            f.id === field.id ? { id: f.id, value: newValue } : f,
          ),
        },
      });
    }

    return await updateMember({
      ...member,
      customFields: {
        ...customFields,
        fields: [...customFields.fields, { id: field.id, value: newValue }],
      },
    });
  };

  return (
    <EditableInput
      defaultValue={value ?? ""}
      onUpdate={updateFieldValue}
      placeholder="Add text"
    />
  );
};
