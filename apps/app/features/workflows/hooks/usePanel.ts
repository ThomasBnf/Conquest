import { create } from "zustand";

type PanelState = {
  panel: "workflow" | "triggers" | "actions" | "node" | undefined;
  setPanel: (panel: "workflow" | "triggers" | "actions" | "node") => void;
};

export const usePanel = create<PanelState>((set) => ({
  panel: undefined,
  setPanel: (panel) => set({ panel }),
}));
