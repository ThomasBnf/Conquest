import { FormControl, FormField, FormItem, FormLabel } from "@conquest/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { Questions } from "../schemas/create-workspace.schema";

type Props = {
  form: UseFormReturn<Questions>;
};

export const Source = ({ form }: Props) => {
  return (
    <FormField
      name="source"
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>How did you hear about us?</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="linkedin">Linkedin</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="youtube">Youtube</SelectItem>
                <SelectItem value="friend">Recommended by a friend</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
};
