import { create } from "zustand";
import type { WorkflowNode } from "../panels/types/node-data";

type SelectedState = {
  selected: WorkflowNode | undefined;
  setSelected: (node: WorkflowNode | undefined) => void;
};

export const useSelected = create<SelectedState>((set) => ({
  selected: undefined,
  setSelected: (node) => set({ selected: node }),
}));
