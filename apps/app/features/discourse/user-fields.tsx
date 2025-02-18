import { useIntegration } from "@/context/integrationContext";
import { Button } from "@conquest/ui/button";
import { Input } from "@conquest/ui/input";
import { Trash } from "lucide-react";
import type { Field } from "./schemas/form-create";

type Props = {
  fields: Field[];
  onRemoveField: (id: string) => void;
  onChangeField: (
    id: string,
    key: "external_id" | "name",
    value: string,
  ) => void;
};

export const UserFields = ({ fields, onRemoveField, onChangeField }: Props) => {
  const { loading } = useIntegration();

  return (
    <div className="space-y-2">
      {fields.map((field) => (
        <div key={field.id} className="flex items-center gap-2">
          <Input
            h="sm"
            placeholder="Id"
            value={field.external_id}
            disabled={loading}
            onChange={(e) =>
              onChangeField(field.id, "external_id", e.target.value)
            }
          />
          <Input
            h="sm"
            placeholder="Name"
            value={field.name}
            disabled={loading}
            onChange={(e) => onChangeField(field.id, "name", e.target.value)}
          />
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => onRemoveField(field.id)}
          >
            <Trash size={16} />
          </Button>
        </div>
      ))}
    </div>
  );
};
