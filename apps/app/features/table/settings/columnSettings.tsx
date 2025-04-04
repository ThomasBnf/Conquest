import { useTable } from "@/hooks/useTable";
import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { Company } from "@conquest/zod/schemas/company.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { Settings2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ColumnItem } from "./column-item";

type Props<TData extends Member | Company> = {
  table: ReturnType<typeof useTable<TData>>;
};

export const ColumnSettings = <TData extends Member | Company>({
  table,
}: Props<TData>) => {
  const { columns, columnOrder, onColumnOrderChange } = table;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const sortedColumns = useMemo(
    () =>
      columns
        .filter((column) => !column.isFixed)
        .sort((a, b) => {
          const aIndex = columnOrder.indexOf(a.key);
          const bIndex = columnOrder.indexOf(b.key);
          return aIndex - bIndex;
        }),
    [columns, columnOrder],
  );

  const columnsIds = useMemo(
    () => sortedColumns.map((column) => column.key),
    [sortedColumns],
  );

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeIndex = columnsIds.indexOf(active.id as string);
      const overIndex = columnsIds.indexOf(over.id as string);
      const columnOrder = arrayMove(columnsIds, activeIndex, overIndex);

      onColumnOrderChange(columnOrder);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          <Settings2 size={16} />
          View
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="end">
        <Command>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search..."
          />
          <CommandEmpty>No columns found.</CommandEmpty>
          <CommandList className="max-h-full">
            <CommandGroup>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                onDragEnd={onDragEnd}
              >
                <SortableContext items={columnsIds}>
                  {sortedColumns.map((column) => {
                    return (
                      <ColumnItem
                        key={column.key}
                        column={column}
                        search={search}
                        table={table}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
