import { create } from "zustand";

type Props = {
  tab: "query" | "select" | "activity" | undefined;
  setTab: (tab: "query" | "select" | "activity" | undefined) => void;
};

export const useTab = create<Props>((set) => ({
  tab: undefined,
  setTab: (tab) => set({ tab }),
}));
