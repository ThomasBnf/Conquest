import type { Filter } from "@conquest/zod/filters.schema";
import type { Dispatch, SetStateAction } from "react";
import { FilterClassic } from "./classic/filter-classic";
import { FilterComplex } from "./complex/filter-complex";

type Props = {
  filters: Filter[];
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  handleUpdateNode?: (filters: Filter[]) => void;
};

export const FiltersList = ({
  filters,
  setFilters,
  handleUpdateNode,
}: Props) => {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {filters.map((filter) => {
        switch (filter.type) {
          case "activity": {
            return (
              <FilterComplex
                key={filter.id}
                filter={filter}
                setFilters={setFilters}
                handleUpdateNode={handleUpdateNode}
              />
            );
          }
          default: {
            return (
              <FilterClassic
                key={filter.id}
                filter={filter}
                setFilters={setFilters}
                handleUpdateNode={handleUpdateNode}
              />
            );
          }
        }
      })}
    </div>
  );
};
