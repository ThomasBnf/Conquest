import {
  CustomField,
  CustomFieldSchema,
} from "@conquest/zod/schemas/custom-field.schema";
import { prisma } from "../prisma";

type Props = CustomField;

export const createField = async (props: Props) => {
  const field = await prisma.customField.create({
    data: {
      ...props,
    },
  });

  return CustomFieldSchema.parse(field);
};
