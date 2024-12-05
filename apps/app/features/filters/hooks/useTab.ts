import { create } from "zustand";

type Props = {
  tab: "input" | "select" | "activity" | undefined;
  setTab: (tab: "input" | "select" | "activity" | undefined) => void;
};

export const useTab = create<Props>((set) => ({
  tab: undefined,
  setTab: (tab) => set({ tab }),
}));
