import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";

export const useParamsCompanies = () => {
  return useQueryStates(
    {
      id: parseAsString.withDefault("name"),
      desc: parseAsBoolean.withDefault(false),
      search: parseAsString.withDefault("").withOptions({
        throttleMs: 500,
        clearOnDefault: true,
        history: "replace",
      }),
    },
    { shallow: false },
  );
};
