import { Column } from "@/features/table/columns/members-columns";
import { trpc } from "@/server/client";
import { Preferences } from "@conquest/zod/schemas/user.schema";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

type UseTableProps<TData> = {
  columns: Column<TData>[];
  data: TData[];
  isLoading: boolean;
  count?: number;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  preferences: Preferences | undefined;
};

export const useTable = <TData>({
  columns,
  data,
  isLoading,
  fetchNextPage,
  hasNextPage,
  count,
  preferences,
}: UseTableProps<TData>) => {
  const { data: session, update } = useSession();
  const { user } = session ?? {};

  const pathname = usePathname();
  const isCompanyPage = pathname.includes("companies");

  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(preferences?.columnVisibility ?? {});

  const [columnOrder, setColumnOrder] = useState<string[]>(
    preferences?.columnOrder ?? [],
  );
  const [selectedRows, setSelectedRows] = useState<TData[]>([]);

  const { mutate } = trpc.users.update.useMutation({
    onSuccess: () => update(),
  });

  const onVisibilityChange = (columnId: string) => {
    if (!user?.id) return;

    const isVisible = columnVisibility[columnId];
    const newVisibility = {
      ...columnVisibility,
      [columnId]: !isVisible,
    };

    setColumnVisibility(newVisibility);

    mutate({
      ...user,
      [isCompanyPage ? "companiesPreferences" : "membersPreferences"]: {
        ...preferences,
        columnVisibility: newVisibility,
      },
    });
  };

  const onColumnOrderChange = (newOrder: string[]) => {
    if (!user?.id) return;

    setColumnOrder(newOrder);

    mutate({
      ...user,
      [isCompanyPage ? "companiesPreferences" : "membersPreferences"]: {
        ...preferences,
        columnOrder: newOrder,
      },
    });
  };

  const onReset = () => setSelectedRows([]);

  return {
    columns,
    data,
    isLoading,
    count,
    fetchNextPage,
    hasNextPage,
    columnVisibility,
    columnOrder,
    selectedRows,
    setSelectedRows,
    onVisibilityChange,
    onColumnOrderChange,
    onReset,
    isAllSelected: data.length > 0 && selectedRows.length === data.length,
    isSomeSelected: selectedRows.length > 0,
    has2Selected: selectedRows.length >= 2,
  };
};
