import { create } from "zustand";
import type { WorkflowNode } from "../panels/schemas/workflow-node.type";
type PANEL =
  | "workflow"
  | "triggers"
  | "actions"
  | "actions-change"
  | "node"
  | undefined;

type PanelState = {
  panel: PANEL;
  node: WorkflowNode | undefined;
  setPanel: ({ panel, node }: { panel: PANEL; node?: WorkflowNode }) => void;
};

export const usePanel = create<PanelState>((set) => ({
  panel: "workflow",
  node: undefined,
  setPanel: ({ panel, node }) => set({ panel, node }),
}));
