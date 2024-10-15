import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";

export const useParamsContacts = () => {
  return useQueryStates(
    {
      id: parseAsString.withDefault("full_name"),
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
