"use client";

import type { Filter } from "@conquest/zod/filters.schema";
import type {
  Category,
  GroupFilter,
  NodeListRecords,
} from "@conquest/zod/node.schema";
import cuid from "cuid";
import { createContext, useContext, useState } from "react";
import { useWorkflow } from "./workflowContext";

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
  node: NodeListRecords;
  children: React.ReactNode;
};

export const FiltersProvider = ({ node, children }: Props) => {
  const { currentNode, onUpdateNode } = useWorkflow();
  const [groupFilters, setGroupFilters] = useState(node.group_filters);

  const onAddGroupFilter = ({ category, filter }: GroupFilterProps) => {
    if (!currentNode) return;

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

    onUpdateNode({
      ...currentNode,
      data: {
        ...node,
        group_filters: [...node.group_filters, newGroupFilter],
      },
    });
  };

  const onUpdateGroupFilter = (updatedGroup: GroupFilter) => {
    if (!currentNode) return;

    const updatedGroupFilters = groupFilters.map((group) =>
      group.id === updatedGroup.id ? updatedGroup : group,
    );

    setGroupFilters(updatedGroupFilters);

    onUpdateNode({
      ...currentNode,
      data: {
        ...node,
        group_filters: updatedGroupFilters,
      },
    });
  };

  const onDeleteGroup = (groupFilter: GroupFilter) => {
    if (!currentNode) return;

    const updatedGroupFilters = groupFilters.filter(
      (group) => group.id !== groupFilter.id,
    );

    setGroupFilters(updatedGroupFilters);

    onUpdateNode({
      ...currentNode,
      data: {
        ...node,
        group_filters: updatedGroupFilters,
      },
    });
  };

  const onAddFilter = ({ groupFilter, filter }: FilterProps) => {
    if (!currentNode) return;

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

    onUpdateNode({
      ...currentNode,
      data: {
        ...node,
        group_filters: updatedGroupFilters,
      },
    });
  };

  const onUpdateFilter = (filter: Filter) => {
    if (!currentNode) return;

    const updatedGroupFilters: GroupFilter[] = groupFilters.map((group) => {
      return {
        ...group,
        filters: group.filters.map((f) => (f.id === filter.id ? filter : f)),
      };
    });

    setGroupFilters(updatedGroupFilters);

    onUpdateNode({
      ...currentNode,
      data: {
        ...node,
        group_filters: updatedGroupFilters,
      },
    });
  };

  const onDeleteFilter = (filter: Filter) => {
    if (!currentNode) return;

    const updatedGroupFilters: GroupFilter[] = groupFilters
      .map((group) => ({
        ...group,
        filters: group.filters.filter((f) => f.id !== filter.id),
      }))
      .filter((group) => group.filters.length > 0);

    setGroupFilters(updatedGroupFilters);

    onUpdateNode({
      ...currentNode,
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
