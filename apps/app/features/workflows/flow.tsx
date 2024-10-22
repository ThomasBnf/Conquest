"use client";

import { Background, Controls, type NodeProps, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflow } from "context/workflowContext";
import { useMemo } from "react";
import { CustomNode } from "./nodes/custom-node";
import { Sidebar } from "./sidebar";

const CustomNodeComponent = (props: NodeProps) => <CustomNode props={props} />;

export const Flow = () => {
  const { nodes, edges, handleNodesChange, handleEdgesChange, onConnect } =
    useWorkflow();

  const nodeTypes = useMemo(() => ({ custom: CustomNodeComponent }), []);

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
      >
        <Controls showInteractive={false} />
        <Background />
      </ReactFlow>
      <Sidebar />
    </div>
  );
};
