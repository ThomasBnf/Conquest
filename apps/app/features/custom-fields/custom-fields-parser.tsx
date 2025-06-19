import { EditableDate } from "@/components/editable/editable-date";
import { EditableInput } from "@/components/editable/editable-input";
import { EditableMultiSelect } from "@/components/editable/editable-multi-select";
import { EditableNumber } from "@/components/editable/editable-number";
import { EditableSelect } from "@/components/editable/editable-select";
import { trpc } from "@/server/client";
import { Record } from "@conquest/zod/enum/record.enum";
import { Company } from "@conquest/zod/schemas/company.schema";
import {
  CustomField,
  CustomFieldDateSchema,
  CustomFieldMultiSelectSchema,
  CustomFieldNumberSchema,
  CustomFieldRecord,
  CustomFieldSelectSchema,
  CustomFieldTextSchema,
} from "@conquest/zod/schemas/custom-field.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import { useUpdateCompany } from "../companies/mutations/useUpdateCompany";
import { useUpdateMember } from "../members/mutations/useUpdateMember";
import { CustomFieldMenu } from "./custom-field-menu";

type Props = {
  member?: Member;
  company?: Company;
  record: Record;
};

export const CustomFieldsParser = ({ member, company, record }: Props) => {
  const { data: fields } = trpc.customFields.list.useQuery({ record });
  const { customFields } = member ?? company ?? {};

  const updateMember = useUpdateMember();
  const updateCompany = useUpdateCompany();

  const onUpdate = async (fields: CustomFieldRecord[]) => {
    if (record === "MEMBER") {
      if (!member) return;

      return await updateMember({
        ...member,
        customFields: fields,
      });
    }

    if (!company) return;

    await updateCompany({
      ...company,
      customFields: fields,
    });
  };

  const onUpdateField = async (
    field: CustomField,
    value: string | string[] | number | null,
  ) => {
    const isExistingField = customFields?.some((f) => f.id === field.id);
    let updatedFields = customFields ?? [];

    if (isExistingField) {
      updatedFields = updatedFields.map((f) => {
        if (f.id !== field.id) return f;

        switch (field.type) {
          case "TEXT":
            return {
              id: field.id,
              type: field.type,
              value: value as string,
            };
          case "NUMBER":
            return {
              id: field.id,
              type: field.type,
              value: value as number | null,
            };
          case "DATE":
            return {
              id: field.id,
              type: field.type,
              value: new Date(value as string),
            };
          case "SELECT":
            return { id: field.id, type: field.type, value: value as string };
          case "MULTISELECT":
            return {
              id: field.id,
              type: field.type,
              values: value as string[],
            };
        }
      });
    } else {
      switch (field.type) {
        case "TEXT":
          updatedFields.push({
            id: field.id,
            type: field.type,
            value: value as string,
          });
          break;
        case "NUMBER":
          updatedFields.push({
            id: field.id,
            type: field.type,
            value: value as number | null,
          });
          break;
        case "DATE":
          updatedFields.push({
            id: field.id,
            type: field.type,
            value: new Date(value as string),
          });
          break;
        case "SELECT":
          updatedFields.push({
            id: field.id,
            type: field.type,
            value: value as string | null,
          });
          break;
        case "MULTISELECT":
          updatedFields.push({
            id: field.id,
            type: field.type,
            values: value as string[],
          });
          break;
      }
    }

    onUpdate(updatedFields);
  };

  const renderField = (field: CustomField) => {
    const memberField = customFields?.find((f) => f.id === field.id);

    switch (field.type) {
      case "TEXT": {
        const textField = memberField
          ? CustomFieldTextSchema.parse(memberField)
          : null;

        return (
          <EditableInput
            key={field.id}
            defaultValue={textField?.value}
            placeholder="Add text"
            onUpdate={(value) => onUpdateField(field, value)}
            customField
          />
        );
      }
      case "NUMBER": {
        const numberField = memberField
          ? CustomFieldNumberSchema.parse(memberField)
          : null;

        return (
          <EditableNumber
            key={field.id}
            defaultValue={numberField?.value ?? null}
            placeholder="Add number"
            onUpdate={(value) => onUpdateField(field, value)}
          />
        );
      }
      case "DATE": {
        const dateField = memberField
          ? CustomFieldDateSchema.parse(memberField)
          : null;

        return (
          <EditableDate
            key={field.id}
            defaultValue={dateField?.value.toISOString()}
            onUpdate={(value) => onUpdateField(field, value.toISOString())}
          />
        );
      }
      case "SELECT": {
        const selectField = memberField
          ? CustomFieldSelectSchema.parse(memberField)
          : null;

        return (
          <EditableSelect
            key={field.id}
            field={field}
            value={selectField?.value ?? null}
            onUpdate={(value) => onUpdateField(field, value)}
          />
        );
      }
      case "MULTISELECT": {
        const multiSelectField = memberField
          ? CustomFieldMultiSelectSchema.parse(memberField)
          : null;

        return (
          <EditableMultiSelect
            field={field}
            values={multiSelectField?.values ?? []}
            onUpdate={(values) => onUpdateField(field, values)}
          />
        );
      }
    }
  };

  return (
    <>
      {fields?.map((field) => (
        <div key={field.id} className="flex flex-col gap-0.5">
          <CustomFieldMenu field={field} />
          {renderField(field)}
        </div>
      ))}
    </>
  );
};
