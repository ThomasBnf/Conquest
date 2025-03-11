"use client";

import { trpc } from "@/server/client";
import {
  type Filter,
  type GroupFilters,
  GroupFiltersSchema,
} from "@conquest/zod/schemas/filters.schema";
import { createContext, useContext, useState } from "react";
import { useUser } from "./userContext";

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
  defaultGroupFilters?: GroupFilters;
  children: React.ReactNode;
};

export const FiltersProvider = ({ defaultGroupFilters, children }: Props) => {
  const { user } = useUser();
  const { members_preferences } = user ?? {};
  const utils = trpc.useUtils();

  const [groupFilters, setGroupFilters] = useState<GroupFilters>(
    defaultGroupFilters ??
      members_preferences?.groupFilters ?? {
        filters: [],
        operator: "AND",
      },
  );

  const { mutateAsync } = trpc.users.update.useMutation({
    onSuccess: () => {
      utils.users.get.invalidate();
    },
  });

  const onAddFilter = async (filter: Filter) => {
    if (!user?.id) return;

    setGroupFilters((prev) => {
      const newGroupFilters = GroupFiltersSchema.parse({
        ...prev,
        filters: [...prev.filters, filter],
      });

      mutateAsync({
        id: user.id,
        members_preferences: {
          ...user.members_preferences,
          groupFilters: newGroupFilters,
        },
      });

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

      mutateAsync({
        id: user.id,
        members_preferences: {
          ...user.members_preferences,
          groupFilters: newGroupFilters,
        },
      });

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

      mutateAsync({
        id: user.id,
        members_preferences: {
          ...user.members_preferences,
          groupFilters: newGroupFilters,
        },
      });

      return newGroupFilters;
    });
  };

  const resetFilters = async () => {
    if (!user?.id) return;

    setGroupFilters({
      filters: [],
      operator: "AND",
    });

    mutateAsync({
      id: user.id,
      members_preferences: {
        ...user.members_preferences,
        groupFilters: { filters: [], operator: "AND" },
      },
    });
  };

  const onUpdateGroupOperator = async (operator: "AND" | "OR") => {
    if (!user?.id) return;

    setGroupFilters((prev) => {
      const newGroupFilters = GroupFiltersSchema.parse({
        ...prev,
        operator,
      });

      mutateAsync({
        id: user.id,
        members_preferences: {
          ...user.members_preferences,
          groupFilters: newGroupFilters,
        },
      });

      return newGroupFilters;
    });
  };

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
