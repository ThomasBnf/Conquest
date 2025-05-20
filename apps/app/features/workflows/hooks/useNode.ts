import { create } from "zustand";
import { WorkflowNode } from "../panels/schemas/workflow-node.type";

type NodeState = {
  node: WorkflowNode | undefined;
  setNode: (node: WorkflowNode | undefined) => void;
};

export const useNode = create<NodeState>((set) => ({
  node: undefined,
  setNode: (node) => set({ node }),
}));
