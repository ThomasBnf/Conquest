import { useTable } from "@/hooks/useTable";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { CommandItem } from "@conquest/ui/command";
import { formatCamelCase } from "@conquest/utils/formatCamelCase";
import { Company } from "@conquest/zod/schemas/company.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Column } from "../columns/members-columns";

type Props<TData extends Member | Company> = {
  column: Column<TData>;
  search: string;
  table: ReturnType<typeof useTable<TData>>;
};

export const ColumnItem = <TData extends Member | Company>({
  column,
  search,
  table,
}: Props<TData>) => {
  const { columnVisibility, onVisibilityChange } = table;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.key });

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <CommandItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="h-8 cursor-default"
    >
      <Checkbox
        checked={!columnVisibility[column.key]}
        onCheckedChange={() => onVisibilityChange(column.key)}
      />
      <span className="ml-2 truncate first-letter:uppercase">
        {formatCamelCase(column.key)}
      </span>
      {!search ? (
        <Button
          {...listeners}
          variant="ghost"
          size="icon_sm"
          className="ml-auto"
        >
          <GripVertical className="size-4" aria-hidden />
        </Button>
      ) : null}
    </CommandItem>
  );
};
