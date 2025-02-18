import { useFilters } from "@/context/filtersContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";

export const AndOrPicker = () => {
  const { groupFilters, onUpdateGroupOperator } = useFilters();
  const { operator } = groupFilters;

  return (
    <Select value={operator} onValueChange={onUpdateGroupOperator}>
      <SelectTrigger className="h-8 w-[70px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="AND">And</SelectItem>
        <SelectItem value="OR">Or</SelectItem>
      </SelectContent>
    </Select>
  );
};
