"use client";

import { createContext, useContext, useState } from "react";
import { WorkflowNode } from "../panels/schemas/workflow-node.type";

type Panel = "workflow" | "node" | "triggers" | "actions" | "actions-change";

type workflowContext = {
  node: WorkflowNode | undefined;
  setNode: (node: WorkflowNode | undefined) => void;
  panel: Panel | undefined;
  setPanel: (panel: Panel) => void;
  condition: "true" | "false" | undefined;
  setCondition: (condition: "true" | "false") => void;
};

const WorkflowContext = createContext<workflowContext>({} as workflowContext);

type Props = {
  children: React.ReactNode;
};

export const WorkflowProvider = ({ children }: Props) => {
  const [node, setNode] = useState<WorkflowNode | undefined>(undefined);
  const [panel, setPanel] = useState<Panel>();
  const [condition, setCondition] = useState<"true" | "false">();

  return (
    <WorkflowContext.Provider
      value={{
        node,
        setNode,
        panel,
        setPanel,
        condition,
        setCondition,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => useContext(WorkflowContext);
