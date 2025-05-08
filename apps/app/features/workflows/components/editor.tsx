"use client";

import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { NodeDataSchema } from "@conquest/zod/schemas/node.schema";
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
import { Info } from "lucide-react";
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
  const { toObject, getNode } = useReactFlow();
  const [nodes, setNodes] = useNodesState<WorkflowNode>(workflow.nodes);
  const [edges, setEdges] = useEdgesState<Edge>(workflow.edges);
  const utils = trpc.useUtils();

  const { mutateAsync: updateWorkflow } = trpc.workflows.update.useMutation({
    onSuccess: () => {
      utils.workflows.get.invalidate({ id: workflow.id });
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

      setTimeout(() => {
        onSave();
      }, 100);
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

  const onSave = async () => {
    const nodes = toObject().nodes.map((node) => {
      const nodeData = NodeDataSchema.parse(node.data);
      return {
        id: node.id,
        data: nodeData,
        position: node.position,
        type: "custom" as const,
      };
    });

    updateWorkflow({
      id: workflow.id,
      nodes,
      edges: toObject().edges,
    });
  };

  const onPublish = async () => {
    await updateWorkflow({
      id: workflow.id,
      published: true,
    });
  };

  useEffect(() => {
    const hasTrigger = nodes.find((node) => "isTrigger" in node.data);

    if (!hasTrigger) {
      setPanel({ panel: "triggers" });
    } else if (!panel) {
      setPanel({ panel: "workflow" });
    }
  }, [nodes]);

  return (
    <div className="relative flex h-full ">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitViewOptions={{
          maxZoom: 1,
        }}
        proOptions={{ hideAttribution: true }}
        fitView
        snapToGrid
        zoomOnDoubleClick
        className="relative"
      >
        {!workflow.published && (
          <div className="absolute top-2 left-2 z-10 flex w-[calc(100%-1rem)] items-center justify-between rounded-md border border-main-100 bg-main-100/50 p-2">
            <div className="flex items-center gap-2 text-main-500">
              <Info size={16} />
              <p>This workflow has not yet been published</p>
            </div>
            <Button onClick={onPublish}>Publish workflow</Button>
          </div>
        )}
        <Controls showInteractive={false} />
        <Background />
      </ReactFlow>
      <Sidebar workflow={workflow} />
    </div>
  );
};
