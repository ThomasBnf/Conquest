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
  condition: "true" | "false" | undefined;
  node: WorkflowNode | undefined;
  setPanel: ({
    panel,
    node,
    condition,
  }: {
    panel: PANEL;
    node?: WorkflowNode;
    condition?: "true" | "false";
  }) => void;
};

export const usePanel = create<PanelState>((set) => ({
  panel: "workflow",
  condition: undefined,
  node: undefined,
  setPanel: ({ panel, node, condition }) => set({ panel, node, condition }),
}));
