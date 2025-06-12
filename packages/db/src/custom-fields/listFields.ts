import { Record } from "@conquest/zod/enum/record.enum";
import { CustomFieldSchema } from "@conquest/zod/schemas/custom-field.schema";
import { prisma } from "../prisma";

type Props = {
  record: Record;
  workspaceId: string;
};

export const listFields = async ({ record, workspaceId }: Props) => {
  const fields = await prisma.customField.findMany({
    where: {
      record,
      workspaceId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return CustomFieldSchema.array().parse(fields);
};
