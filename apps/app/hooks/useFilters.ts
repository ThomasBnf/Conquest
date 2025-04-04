import { trpc } from "@/server/client";
import {
  Filter,
  GroupFilters,
  GroupFiltersSchema,
} from "@conquest/zod/schemas/filters.schema";
import { useSession } from "next-auth/react";
import { useState } from "react";

type Props = {
  initialGroupFilters?: GroupFilters;
};

export const useFilters = ({ initialGroupFilters }: Props) => {
  const { data: session, update } = useSession();
  const { user } = session ?? {};
  const { members_preferences } = user ?? {};

  const [groupFilters, setGroupFilters] = useState<GroupFilters>(
    initialGroupFilters ??
      members_preferences?.groupFilters ?? {
        filters: [],
        operator: "AND",
      },
  );

  const { mutateAsync } = trpc.users.update.useMutation({
    onSuccess: () => update(),
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

  return {
    groupFilters,
    onAddFilter,
    onUpdateFilter,
    onDeleteFilter,
    resetFilters,
    onUpdateGroupOperator,
  };
};
