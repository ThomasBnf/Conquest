"use client";

import { usePanel } from "@/features/workflows/hooks/usePanel";
import { trpc } from "@/server/client";
import {
  type Filter,
  type GroupFilters,
  GroupFiltersSchema,
} from "@conquest/zod/schemas/filters.schema";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

type filtersContext = {
  groupFilters: GroupFilters;
  onAddFilter: (filter: Filter) => Promise<void>;
  onUpdateFilter: (filter: Filter) => Promise<void>;
  onDeleteFilter: (filter: Filter) => Promise<void>;
  resetFilters: () => Promise<void>;
  onUpdateGroupOperator: (operator: "AND" | "OR") => Promise<void>;
};

const FiltersContext = createContext<filtersContext>({} as filtersContext);

type Props = {
  initialGroupFilters?: GroupFilters;
  saveFilters?: (groupFilters: GroupFilters) => void;
  children: React.ReactNode;
};

export const FiltersProvider = ({
  initialGroupFilters,
  saveFilters,
  children,
}: Props) => {
  const { data: session, update } = useSession();
  const { user } = session ?? {};
  const { node } = usePanel();
  const { membersPreferences } = user ?? {};

  const [currentNodeId, setCurrentNodeId] = useState<string | undefined>();
  const [groupFilters, setGroupFilters] = useState<GroupFilters>(
    initialGroupFilters ??
      membersPreferences?.groupFilters ?? {
        filters: [],
        operator: "AND",
      },
  );

  const { mutateAsync } = trpc.users.update.useMutation({
    onSuccess: () => {
      update();
    },
  });

  const onAddFilter = async (filter: Filter) => {
    if (!user?.id) return;

    setGroupFilters((prev) => {
      const newGroupFilters = GroupFiltersSchema.parse({
        ...prev,
        filters: [...prev.filters, filter],
      });
      onSaveFilters(newGroupFilters);
      return newGroupFilters;
    });
  };

  const onUpdateFilter = async (filter: Filter) => {
    if (!user?.id) return;

    setGroupFilters((prev) => {
      const newGroupFilters = GroupFiltersSchema.parse({
        ...prev,
        filters: prev.filters.map((_filter) =>
          _filter.id === filter.id ? filter : _filter,
        ),
      });
      onSaveFilters(newGroupFilters);
      return newGroupFilters;
    });
  };

  const onDeleteFilter = async (filter: Filter) => {
    if (!user?.id) return;

    setGroupFilters((prev) => {
      const newGroupFilters = GroupFiltersSchema.parse({
        ...prev,
        filters: prev.filters.filter((_filter) => _filter.id !== filter.id),
      });
      onSaveFilters(newGroupFilters);
      return newGroupFilters;
    });
  };

  const resetFilters = async () => {
    if (!user?.id) return;

    const newGroupFilters: GroupFilters = {
      filters: [],
      operator: "AND",
    };

    setGroupFilters(newGroupFilters);
    onSaveFilters(newGroupFilters);
  };

  const onUpdateGroupOperator = async (operator: "AND" | "OR") => {
    if (!user?.id) return;

    setGroupFilters((prev) => {
      const newGroupFilters = GroupFiltersSchema.parse({
        ...prev,
        operator,
      });
      onSaveFilters(newGroupFilters);
      return newGroupFilters;
    });
  };

  const onSaveFilters = async (newGroupFilters: GroupFilters) => {
    if (!saveFilters && user) {
      return mutateAsync({
        id: user.id,
        membersPreferences: {
          ...user.membersPreferences,
          groupFilters: newGroupFilters,
        },
      });
    }

    saveFilters?.(newGroupFilters);
  };

  useEffect(() => {
    if (initialGroupFilters && node && node?.id !== currentNodeId) {
      setCurrentNodeId(node?.id);
      setGroupFilters(initialGroupFilters);
    }
  }, [initialGroupFilters, node]);

  return (
    <FiltersContext.Provider
      value={{
        groupFilters,
        onAddFilter,
        onUpdateFilter,
        onDeleteFilter,
        resetFilters,
        onUpdateGroupOperator,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => useContext(FiltersContext);
