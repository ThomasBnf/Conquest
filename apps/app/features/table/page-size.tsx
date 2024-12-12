import { tableParsers } from "@/lib/searchParamsTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import { useQueryStates } from "nuqs";

export const PageSize = () => {
  const [{ pageSize }, setParams] = useQueryStates(tableParsers);

  return (
    <Select
      defaultValue={pageSize.toString()}
      onValueChange={(value) => setParams({ pageSize: Number(value) })}
    >
      <SelectTrigger className="w-fit min-w-20">
        <SelectValue>{pageSize}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="10">10</SelectItem>
        <SelectItem value="25">25</SelectItem>
        <SelectItem value="50">50</SelectItem>
        <SelectItem value="100">100</SelectItem>
      </SelectContent>
    </Select>
  );
};
