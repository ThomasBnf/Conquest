import {
  CustomField,
  CustomFieldRecord,
} from "@conquest/zod/schemas/custom-field.schema";

type Props = {
  customFields: (CustomField | null)[];
  member: Record<string, string>;
};

export const getFieldsValue = ({ customFields, member }: Props) => {
  return customFields
    .filter(Boolean)
    .map((field) => {
      if (!field || !member[field.id]) return null;

      const value = member[field.id] ?? "";

      if (field.type === "SELECT") {
        const matchingOption = field.options?.find(
          (option) => option.label === value,
        );

        if (matchingOption) {
          return {
            id: field.id,
            type: field.type,
            value: matchingOption.id,
          };
        }
      }

      if (field.type === "MULTISELECT") {
        if (!value.trim()) return null;

        const values = value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);

        if (values.length === 0) return null;

        const optionIds = values
          .map((val) => {
            const option = field.options?.find((opt) => opt.label === val);
            return option?.id;
          })
          .filter(Boolean);

        if (optionIds.length > 0) {
          return {
            id: field.id,
            type: field.type,
            values: optionIds,
          };
        }
      }

      if (field.type === "DATE") {
        if (!value.trim()) return null;

        const dateValue = new Date(value);

        if (!Number.isNaN(dateValue.getTime())) {
          return {
            id: field.id,
            type: field.type,
            value: dateValue,
          };
        }
      }

      if (field.type === "NUMBER") {
        if (!value.trim()) return null;

        if (!Number.isNaN(Number(value))) {
          return {
            id: field.id,
            type: field.type,
            value: value.trim(),
          };
        }

        return null;
      }

      if (field.type === "TEXT") {
        if (!value.trim()) return null;

        const safeValue = value.replace(/'/g, "''");

        return {
          id: field.id,
          type: field.type,
          value: safeValue,
        };
      }

      return {
        id: field.id,
        type: field.type,
        value,
      };
    })
    .filter(Boolean) as CustomFieldRecord[];
};
