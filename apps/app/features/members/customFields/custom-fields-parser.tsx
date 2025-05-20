import { trpc } from "@/server/client";
import { CustomField } from "@conquest/zod/schemas/custom-fields.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import { CustomFieldMenu } from "./custom-field-menu";
import { FieldText } from "./field-text";

type Props = {
  member: Member;
};

export const CustomFieldsParser = ({ member }: Props) => {
  const { data: workspace } = trpc.workspaces.get.useQuery();
  const { customFields } = workspace ?? {};

  if (!customFields?.length || !workspace) return null;

  const renderField = (field: CustomField) => {
    switch (field.type) {
      case "text":
        return <FieldText field={field} member={member} />;
      // case "number":
      //   return <FieldNumber field={field} member={member} />;
      // case "date":
      //   return <FieldDate field={field} member={member} />;
      // case "select":
      //   return <FieldSelect field={field} member={member} />;
      // case "multi-select":
      //   return <FieldMultiSelect field={field} member={member} />;
    }
  };

  return (
    <>
      {customFields?.map((field) => (
        <div key={field.id} className="-ml-[6px] flex flex-col">
          <CustomFieldMenu field={field} workspace={workspace} />
          <div>{renderField(field)}</div>
        </div>
      ))}
    </>
  );
};
