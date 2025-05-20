import { create } from "zustand";
type PANEL =
  | "workflow"
  | "triggers"
  | "actions"
  | "actions-change"
  | "node"
  | undefined;

type PanelState = {
  panel: PANEL;
  condition: "true" | "false" | undefined;
  setPanel: ({
    panel,
    condition,
  }: {
    panel: PANEL;
    condition?: "true" | "false";
  }) => void;
};

export const usePanel = create<PanelState>((set) => ({
  panel: "workflow",
  condition: undefined,
  setPanel: ({ panel, condition }) => set({ panel, condition }),
}));
