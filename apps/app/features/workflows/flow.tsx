"use client";

import { runWorkflow } from "@/actions/workflows/runWorkflow";
import { Button } from "@conquest/ui/button";
import { Background, Controls, type NodeProps, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflow } from "context/workflowContext";
import { MousePointerClick } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CustomNode } from "./nodes/custom-node";
import { Sidebar } from "./sidebar";

const CustomNodeComponent = (props: NodeProps) => <CustomNode props={props} />;

export const Flow = () => {
  const [running, setRunning] = useState(false);
  const {
    nodes,
    edges,
    handleNodesChange,
    handleEdgesChange,
    onConnect,
    workflow,
  } = useWorkflow();

  const nodeTypes = useMemo(() => ({ custom: CustomNodeComponent }), []);

  const hasManualTrigger = useMemo(() => {
    return (
      workflow.published &&
      nodes.some((node) => node.data.type === "trigger-manual-run")
    );
  }, [workflow, nodes]);

  const onRunWorkflow = async () => {
    setRunning(true);
    const run = await runWorkflow({ id: workflow.id });
    const error = run?.serverError;
    const success = run?.data;

    if (error) toast.error(error);
    if (success) toast.success("Workflow successfully run");
    setRunning(false);
  };

  return (
    <div className="flex h-full w-full divide-x">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitViewOptions={{
          maxZoom: 1,
        }}
        fitView
        snapToGrid
        zoomOnDoubleClick
        proOptions={{ hideAttribution: true }}
        className="relative"
      >
        <Controls showInteractive={false} />
        <Background />
        {hasManualTrigger && (
          <Button
            onClick={onRunWorkflow}
            className="absolute top-4 right-4 z-50 cursor-pointer"
            loading={running}
          >
            <MousePointerClick size={16} />
            Run workflow
          </Button>
        )}
      </ReactFlow>
      <Sidebar />
    </div>
  );
};
