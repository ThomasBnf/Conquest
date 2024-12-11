import { create } from "zustand";

type PanelState = {
  panel:
    | "workflow"
    | "triggers"
    | "actions"
    | "actions-change"
    | "node"
    | undefined;
  setPanel: (
    panel:
      | "workflow"
      | "triggers"
      | "actions"
      | "actions-change"
      | "node"
      | undefined,
  ) => void;
};

export const usePanel = create<PanelState>((set) => ({
  panel: "workflow",
  setPanel: (panel) => set({ panel }),
}));
