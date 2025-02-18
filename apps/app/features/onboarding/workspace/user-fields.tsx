import { FormControl, FormField, FormItem, FormLabel } from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { Workspace } from "../schemas/create-workspace.schema";

type Props = {
  form: UseFormReturn<Workspace>;
};

export const UserFields = ({ form }: Props) => {
  return (
    <div className="flex items-center gap-4">
      <FormField
        name="first_name"
        control={form.control}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input placeholder="Tom" autoFocus {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        name="last_name"
        control={form.control}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <Input placeholder="Richard" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
