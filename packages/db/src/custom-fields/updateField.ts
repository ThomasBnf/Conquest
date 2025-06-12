import {
  type CustomField,
  CustomFieldSchema,
} from "@conquest/zod/schemas/custom-field.schema";
import { prisma } from "../prisma";

type Props = {
  id: string;
} & Partial<CustomField>;

export const updateField = async ({ id, ...data }: Props) => {
  const field = await prisma.customField.update({
    where: {
      id,
    },
    data,
  });

  return CustomFieldSchema.parse(field);
};
