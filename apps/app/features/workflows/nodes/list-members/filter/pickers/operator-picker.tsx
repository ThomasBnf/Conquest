import { useFilters } from "@/context/filtersContext";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import {
  BaseOperatorSchema,
  DateOperatorSchema,
  type Filter,
  NumberOperatorSchema,
  type Operator,
} from "@conquest/zod/filters.schema";
import { OPERATORS } from "constant/operators";
import { ChevronDown } from "lucide-react";

type Props = {
  filter: Filter;
};

export const OperatorPicker = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();

  const onUpdateOperator = ({ operator }: { operator: Operator }) => {
    const parsedOperator = BaseOperatorSchema.parse(operator);
    onUpdateFilter({
      ...filter,
      operator: parsedOperator,
    } as Filter);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="dropdown"
          className="w-full rounded-none whitespace-nowrap"
          classNameSpan="justify-between"
        >
          {filter.operator.split("_").join(" ")}
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {OPERATORS.filter((operator) => {
          if (filter.field === "created_at") {
            return DateOperatorSchema.safeParse(operator).success;
          }

          if (filter.field === "tags") {
            return BaseOperatorSchema.safeParse(operator).success;
          }

          if (filter.field === "points") {
            return NumberOperatorSchema.safeParse(operator).success;
          }

          const isValid = BaseOperatorSchema.safeParse(operator).success;
          if (!isValid) return false;

          return true;
        }).map((operator) => (
          <DropdownMenuItem
            key={operator}
            onClick={() => onUpdateOperator({ operator })}
          >
            {operator.split("_").join(" ")}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
