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
  const { data: session, update } = useSession();
  const { user } = session ?? {};
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { mutateAsync } = trpc.users.update.useMutation({
    onSuccess: () => update(),
  });

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const columns = table.getAllColumns().filter((column) => column.getCanHide());
  const columnsOrder = table.getState().columnOrder;

  const sortedColumns = useMemo(
    () =>
      columns.sort((a, b) => {
        const aIndex = columnsOrder.indexOf(a.id);
        const bIndex = columnsOrder.indexOf(b.id);
        return aIndex - bIndex;
      }),
    [columns, columnsOrder],
  );

  const columnsIds = useMemo(
    () => sortedColumns.map((column) => column.id),
    [sortedColumns],
  );

  const onDragEnd = async (event: DragEndEvent) => {
    if (!user) return;

    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeIndex = columnsIds.indexOf(active.id as string);
      const overIndex = columnsIds.indexOf(over.id as string);

      const columnOrder = arrayMove(columnsIds, activeIndex, overIndex);
      table.setColumnOrder(columnOrder);

      if (type === "members") {
        await mutateAsync({
          ...user,
          members_preferences: {
            ...user.members_preferences,
            columnOrder,
          },
        });
      } else {
        await mutateAsync({
          ...user,
          companies_preferences: {
            ...user.companies_preferences,
            columnOrder,
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
                <SortableContext items={columnsIds}>
                  {sortedColumns.map((column) => {
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
