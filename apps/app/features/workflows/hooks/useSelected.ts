import { create } from "zustand";
import type { WorkflowNode } from "../panels/schemas/workflow-node.type";

type SelectedState = {
  selected: WorkflowNode | undefined;
  setSelected: (node: WorkflowNode | undefined) => void;
};

export const useSelected = create<SelectedState>((set) => ({
  selected: undefined,
  setSelected: (node) => set({ selected: node }),
}));
