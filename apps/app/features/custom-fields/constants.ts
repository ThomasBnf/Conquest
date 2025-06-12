import { Record } from "@conquest/zod/enum/record.enum";
import { CustomField } from "@conquest/zod/schemas/custom-field.schema";
import { v4 as uuid } from "uuid";

export const customFields = (
  record: Record,
  workspaceId: string,
): CustomField[] => [
  {
    id: uuid(),
    label: "Text",
    type: "TEXT",
    record,
    workspaceId,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuid(),
    label: "Number",
    type: "NUMBER",
    record,
    workspaceId,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuid(),
    label: "Date",
    type: "DATE",
    record,
    workspaceId,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuid(),
    label: "Select",
    type: "SELECT",
    options: [],
    record,
    workspaceId,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuid(),
    label: "Multi-select",
    type: "MULTISELECT",
    options: [],
    record,
    workspaceId,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
