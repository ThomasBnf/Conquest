import { tableParams } from "@/utils/tableParams";
import {
  type ColumnDef,
  type ColumnOrderState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useQueryStates } from "nuqs";
import { useState } from "react";

type Props<TData, TValue> = {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  count: number;
  left: string[];
  id: string;
  desc: boolean;
  type: "members" | "companies";
};

export const useTable = <TData, TValue>({
  data,
  columns,
  count,
  left,
  id,
  desc,
  type,
}: Props<TData, TValue>) => {
  const { data: session } = useSession();
  const { user } = session ?? {};
  const { members_preferences, companies_preferences } = user ?? {};
  const [{ page, pageSize }] = useQueryStates(tableParams);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    type === "members"
      ? (members_preferences?.columnVisibility ?? {})
      : (companies_preferences?.columnVisibility ?? {}),
  );
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    type === "members"
      ? (members_preferences?.columnOrder ?? [])
      : (companies_preferences?.columnOrder ?? []),
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([{ id, desc }]);
  const [pagination, setPagination] = useState({
    pageIndex: page,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(count / pageSize),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualPagination: true,
    manualSorting: true,
    state: {
      columnVisibility,
      columnOrder,
      rowSelection,
      sorting,
      pagination,
    },
    initialState: {
      columnPinning: {
        left,
      },
    },
  });

  return { table, type };
};
