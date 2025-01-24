import { create } from "zustand";

type Props = {
  tab:
    | "input"
    | "select"
    | "activity"
    | "level"
    | "linked_profiles"
    | undefined;
  setTab: (
    tab:
      | "input"
      | "select"
      | "activity"
      | "level"
      | "linked_profiles"
      | undefined,
  ) => void;
};

export const useTab = create<Props>((set) => ({
  tab: undefined,
  setTab: (tab) => set({ tab }),
}));
