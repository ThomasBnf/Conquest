"use client";

import { trpc } from "@/server/client";
import { Workflow } from "@conquest/zod/schemas/workflow.schema";
import {
  Background,
  Connection,
  Controls,
  type Edge,
  EdgeChange,
  type EdgeProps,
  NodeChange,
  type NodeProps,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { usePanel } from "../hooks/usePanel";
import { CustomEdge } from "../nodes/custom-edge";
import { CustomNode } from "../nodes/custom-node";
import type { WorkflowNode } from "../panels/schemas/workflow-node.type";
import { Sidebar } from "./sidebar";

type Props = {
  workflow: Workflow;
};

const nodeTypes = {
  custom: (props: NodeProps<WorkflowNode>) => <CustomNode {...props} />,
};

const edgeTypes = {
  custom: (props: EdgeProps) => <CustomEdge {...props} />,
};

export const Editor = ({ workflow }: Props) => {
  const { panel, setPanel } = usePanel();

  const {
    toObject,
    deleteElements,
    addEdges,
    updateNodeData,
    updateNode,
    fitView,
    getNode,
  } = useReactFlow();

  const [nodes, setNodes] = useNodesState<WorkflowNode>(workflow.nodes);
  const [edges, setEdges] = useEdgesState<Edge>(workflow.edges);

  const { mutateAsync: updateWorkflow } = trpc.workflows.update.useMutation({
    onSuccess: () => {
      toast.success("Workflow updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((prev) => {
        if (changes[0]?.type === "remove") {
          const { id } = changes[0];
          const node = getNode(id);

          if (node && "isTrigger" in node.data) return prev;
        }
        return applyNodeChanges(changes, prev) as WorkflowNode[];
      });
    },
    [getNode, setNodes],
  );

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds) as Edge[]);
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = { ...connection, type: "custom" };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges],
  );

  useEffect(() => {
    const hasTrigger = nodes.find((node) => "isTrigger" in node.data);

    if (!hasTrigger) {
      setPanel({ panel: "triggers" });
    } else if (!panel) {
      setPanel({ panel: "workflow" });
    }
  }, [nodes]);

  console.log(nodes);

  return (
    <div className="flex h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: "custom",
        }}
        fitViewOptions={{
          maxZoom: 1,
        }}
        proOptions={{ hideAttribution: true }}
        fitView
        snapToGrid
        zoomOnDoubleClick
      >
        <Controls showInteractive={false} />
        <Background />
      </ReactFlow>
      <Sidebar />
    </div>
  );
};
