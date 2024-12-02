"use client";

import { useSelected } from "@/features/workflows/hooks/useSelected";
import type { Filter } from "@conquest/zod/filters.schema";
import type {
  Category,
  GroupFilter,
  NodeListMembers,
} from "@conquest/zod/node.schema";
import { useReactFlow } from "@xyflow/react";
import cuid from "cuid";
import { createContext, useContext, useState } from "react";

type GroupFilterProps = {
  category: Category;
  filter: Filter;
};

type FilterProps = {
  groupFilter: GroupFilter;
  filter: Filter;
};

type filtersContext = {
  groupFilters: GroupFilter[];
  setGroupFilters: React.Dispatch<React.SetStateAction<GroupFilter[]>>;
  onAddGroupFilter: ({ category, filter }: GroupFilterProps) => void;
  onUpdateGroupFilter: (group: GroupFilter) => void;
  onDeleteGroup: (group: GroupFilter) => void;
  onAddFilter: ({ groupFilter, filter }: FilterProps) => void;
  onUpdateFilter: (filter: Filter) => void;
  onDeleteFilter: (filter: Filter) => void;
};

const filtersContext = createContext<filtersContext>({} as filtersContext);

type Props = {
  node: NodeListMembers;
  children: React.ReactNode;
};

export const FiltersProvider = ({ node, children }: Props) => {
  const { selected } = useSelected();
  const { updateNode } = useReactFlow();
  const [groupFilters, setGroupFilters] = useState(node.group_filters);

  const onAddGroupFilter = ({ category, filter }: GroupFilterProps) => {
    if (!selected) return;

    const newGroupFilter: GroupFilter = {
      id: cuid(),
      category,
      operator: "and",
      filters: [
        {
          ...filter,
          id: cuid(),
        },
      ],
    };

    setGroupFilters((prev) => [...prev, newGroupFilter]);

    updateNode(selected.id, {
      ...selected,
      data: {
        ...node,
        group_filters: [...node.group_filters, newGroupFilter],
      },
    });
  };

  const onUpdateGroupFilter = (updatedGroup: GroupFilter) => {
    if (!selected) return;

    const updatedGroupFilters = groupFilters.map((group) =>
      group.id === updatedGroup.id ? updatedGroup : group,
    );

    setGroupFilters(updatedGroupFilters);

    updateNode(selected.id, {
      ...selected,
      data: {
        ...node,
        group_filters: updatedGroupFilters,
      },
    });
  };

  const onDeleteGroup = (groupFilter: GroupFilter) => {
    if (!selected) return;

    const updatedGroupFilters = groupFilters.filter(
      (group) => group.id !== groupFilter.id,
    );

    setGroupFilters(updatedGroupFilters);

    updateNode(selected.id, {
      ...selected,
      data: {
        ...node,
        group_filters: updatedGroupFilters,
      },
    });
  };

  const onAddFilter = ({ groupFilter, filter }: FilterProps) => {
    if (!selected) return;

    const newFilter: Filter = {
      ...filter,
      id: cuid(),
    };

    const updatedGroupFilters = groupFilters.map((group) =>
      group.id === groupFilter.id
        ? { ...group, filters: [...group.filters, newFilter] }
        : group,
    );

    setGroupFilters(updatedGroupFilters);

    updateNode(selected.id, {
      ...selected,
      data: {
        ...node,
        group_filters: updatedGroupFilters,
      },
    });
  };

  const onUpdateFilter = (filter: Filter) => {
    if (!selected) return;

    const updatedGroupFilters: GroupFilter[] = groupFilters.map((group) => {
      return {
        ...group,
        filters: group.filters.map((f) => (f.id === filter.id ? filter : f)),
      };
    });

    setGroupFilters(updatedGroupFilters);

    updateNode(selected.id, {
      ...selected,
      data: {
        ...node,
        group_filters: updatedGroupFilters,
      },
    });
  };

  const onDeleteFilter = (filter: Filter) => {
    if (!selected) return;

    const updatedGroupFilters: GroupFilter[] = groupFilters
      .map((group) => ({
        ...group,
        filters: group.filters.filter((f) => f.id !== filter.id),
      }))
      .filter((group) => group.filters.length > 0);

    setGroupFilters(updatedGroupFilters);

    updateNode(selected.id, {
      ...selected,
      data: {
        ...node,
        group_filters: updatedGroupFilters,
      },
    });
  };

  return (
    <filtersContext.Provider
      value={{
        groupFilters,
        setGroupFilters,
        onAddGroupFilter,
        onUpdateGroupFilter,
        onDeleteGroup,
        onAddFilter,
        onUpdateFilter,
        onDeleteFilter,
      }}
    >
      {children}
    </filtersContext.Provider>
  );
};

export const useFilters = () => useContext(filtersContext);
