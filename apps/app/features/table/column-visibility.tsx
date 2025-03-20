import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
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
import type { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { ColumnItem } from "./column-item";

type Props<TData> = {
  table: Table<TData>;
  type: "members" | "companies";
};

export const ColumnVisibility = <TData,>({ table, type }: Props<TData>) => {
  const { data: session } = useSession();
  const { user } = session ?? {};
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { mutateAsync } = trpc.users.update.useMutation();
  const columnOrder = table.getState().columnOrder;
  const allColumns = table.getAllColumns();

  const sortedColumns = useMemo(() => {
    // If no column order is set, use the default order
    if (!columnOrder || columnOrder.length === 0) {
      return allColumns;
    }

    // Create a map for faster lookups
    const orderMap = new Map(columnOrder.map((id, index) => [id, index]));

    // Sort columns based on the current column order
    return [...allColumns].sort((a, b) => {
      const aIndex = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const bIndex = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return aIndex - bIndex;
    });
  }, [allColumns, columnOrder]);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const onDragEnd = async (event: DragEndEvent) => {
    if (!user) return;

    const { active, over } = event;

    if (over && active.id !== over.id) {
      const columns = table.getAllColumns().map((column) => column.id);

      const activeIndex = columns.indexOf(active.id as string);
      const overIndex = columns.indexOf(over.id as string);

      const newColumnOrder = arrayMove(columns, activeIndex, overIndex);
      table.setColumnOrder(newColumnOrder);

      if (type === "members") {
        await mutateAsync({
          ...user,
          members_preferences: {
            ...user.members_preferences,
            columnOrder: newColumnOrder,
          },
        });
      } else {
        await mutateAsync({
          ...user,
          companies_preferences: {
            ...user.companies_preferences,
            columnOrder: newColumnOrder,
          },
        });
      }
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
          <CommandList className="max-h-full">
            <CommandGroup>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={sortedColumns.map((column) => column.id)}
                >
                  {sortedColumns
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <ColumnItem
                          key={column.id}
                          column={column}
                          search={search}
                          type={type}
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
