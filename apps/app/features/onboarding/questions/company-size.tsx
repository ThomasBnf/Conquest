import { FormControl, FormField, FormItem, FormLabel } from "@conquest/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { Questions } from "../schemas/workspace-form.schema";

type Props = {
  form: UseFormReturn<Questions>;
};

export const CompanySize = ({ form }: Props) => {
  return (
    <FormField
      name="companySize"
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>How large is your company?</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="just_me">Just me</SelectItem>
                <SelectItem value="1-5">2-5</SelectItem>
                <SelectItem value="5-25">6-25</SelectItem>
                <SelectItem value="25-100">26-100</SelectItem>
                <SelectItem value="100-250">101-250</SelectItem>
                <SelectItem value="250-1000">251-1000</SelectItem>
                <SelectItem value="1000+">1000+</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
};
