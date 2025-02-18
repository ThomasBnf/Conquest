import { useUser } from "@/context/userContext";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { Column, Table } from "@tanstack/react-table";
import { Check, Settings2 } from "lucide-react";
import { useState } from "react";

type Props<TData> = {
  table: Table<TData>;
  type: "members" | "companies";
};

export const ColumnVisibility = <TData,>({ table, type }: Props<TData>) => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.users.updateUser.useMutation({
    onSuccess: () => utils.users.getCurrentUser.invalidate(),
  });

  const onClick = (column: Column<TData>) => {
    if (!user?.id) return;

    const isVisible = !column.getIsVisible();
    column.toggleVisibility(isVisible);

    const { members_preferences, companies_preferences } = user;
    const currentVisibility =
      type === "members"
        ? (members_preferences?.columnVisibility ?? {})
        : (companies_preferences?.columnVisibility ?? {});

    mutateAsync({
      id: user.id,
      data: {
        ...user,
        ...(type === "members"
          ? {
              members_preferences: {
                ...members_preferences,
                columnVisibility: {
                  ...currentVisibility,
                  [column.id]: isVisible,
                },
              },
            }
          : {
              companies_preferences: {
                ...companies_preferences,
                columnVisibility: {
                  ...currentVisibility,
                  [column.id]: isVisible,
                },
              },
            }),
      },
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          <Settings2 size={16} />
          View
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[160px] p-0" align="end">
        <Command>
          <CommandList className="max-h-full">
            <CommandGroup>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <CommandItem
                      key={column.id}
                      onSelect={() => onClick(column)}
                    >
                      <span className="truncate first-letter:uppercase">
                        {column.id.replaceAll("_", " ")}
                      </span>
                      <Check
                        size={16}
                        className={cn(
                          "ml-auto shrink-0",
                          column.getIsVisible() ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
