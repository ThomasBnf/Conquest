import { listFields } from "@conquest/db/custom-fields/listFields";
import { updateField } from "@conquest/db/custom-fields/updateField";
import { getRandomColor } from "@conquest/utils/getRandomColor";
import { Option } from "@conquest/zod/schemas/custom-field.schema";
import { logger } from "@trigger.dev/sdk/v3";
import { v4 as uuid } from "uuid";

type Props = {
  members: Record<string, string>[];
  mappedColumns: Record<string, string>;
  workspaceId: string;
};

export const processOptions = async ({
  members,
  mappedColumns,
  workspaceId,
}: Props) => {
  const customFields = await listFields({ record: "MEMBER", workspaceId });
  const customFieldsMap = customFields.filter((field) =>
    Object.values(mappedColumns).includes(field.id),
  );

  const processedFields = customFieldsMap.map(async (field) => {
    if (!["SELECT", "MULTISELECT"].includes(field.type)) return field;

    const uniqueOptions = [
      ...new Set(members.map((member) => member[field.id]).filter(Boolean)),
    ];

    if (uniqueOptions.length === 0) return null;

    const existingLabels = new Set(
      field.options?.map((option) => option.label) || [],
    );

    const newOptionsLabels = uniqueOptions.filter(
      (option) => !existingLabels.has(option as string),
    );

    if (newOptionsLabels.length === 0) return field;

    const newOptions: Option[] = newOptionsLabels.map((option) => ({
      id: uuid(),
      label: option as string,
      color: getRandomColor(),
    }));

    const updatedField = await updateField({
      ...field,
      options: [...(field.options ?? []), ...newOptions],
    });

    logger.info("Added new options", {
      fieldId: field.id,
      options: newOptions,
    });

    return updatedField;
  });

  return await Promise.all(processedFields);
};
