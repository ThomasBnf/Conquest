import { trpc } from "@/server/client";
import { Checkbox } from "@conquest/ui/checkbox";
import { CommandItem } from "@conquest/ui/command";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column } from "@tanstack/react-table";
import { useSession } from "next-auth/react";

type Props<TData> = {
  column: Column<TData, unknown>;
  search: string;
  type: "members" | "companies";
};

export const ColumnItem = <TData,>({ column, search, type }: Props<TData>) => {
  const { data: session } = useSession();
  const { user } = session ?? {};

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const { mutateAsync } = trpc.users.update.useMutation();

  const onSelect = async (column: Column<TData>) => {
    if (!user?.id) return;

    const isVisible = !column.getIsVisible();
    column.toggleVisibility(isVisible);

    const { members_preferences, companies_preferences } = user;
    const currentVisibility =
      type === "members"
        ? (members_preferences?.columnVisibility ?? {})
        : (companies_preferences?.columnVisibility ?? {});

    await mutateAsync({
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
    });
  };

  return (
    <CommandItem ref={setNodeRef} style={style} {...attributes}>
      <Checkbox
        checked={column.getIsVisible()}
        onCheckedChange={() => onSelect(column)}
      />
      <span className="ml-2 truncate first-letter:uppercase">
        {column.id.replaceAll("_", " ")}
      </span>
      {/* {!search ? (
        <Button
          {...listeners}
          variant="ghost"
          size="icon_sm"
          className="ml-auto"
        >
          <GripVertical className="size-4" aria-hidden />
        </Button>
      ) : null} */}
    </CommandItem>
  );
};
