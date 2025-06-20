"use client";

import { Button } from "@conquest/ui/button";
import { EdgeSchema } from "@conquest/zod/schemas/edge.schema";
import { NodeDataSchema, NodeSchema } from "@conquest/zod/schemas/node.schema";
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
  OnSelectionChangeParams,
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
import { useWorkflow } from "../context/workflowContext";
import { useUpdateWorkflow } from "../mutations/useUpdateWorkflow";
import { CustomEdge } from "../nodes/custom-edge";
import { CustomNode } from "../nodes/custom-node";
import type { WorkflowNode } from "../panels/schemas/workflow-node.type";
import { Sidebar } from "../panels/sidebar";

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
  const { setNode, panel, setPanel, focus } = useWorkflow();
  const { toObject, getNode } = useReactFlow();
  const [nodes, setNodes] = useNodesState<WorkflowNode>(workflow.nodes);
  const [edges, setEdges] = useEdgesState<Edge>(workflow.edges);
  const updateWorkflow = useUpdateWorkflow();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((prev) => {
        if (changes[0]?.type === "remove") {
          if (focus) return prev;

          const { id } = changes[0];
          const node = getNode(id);

          if (node?.data) {
            const isTrigger = "isTrigger" in node.data;

            setTimeout(() => {
              setPanel(isTrigger ? "node" : "workflow");
            }, 0);

            if (isTrigger) return prev;
          }
        }
        if (changes[0]?.type === "replace") {
          const { id, item } = changes[0];
          const node = getNode(id);

          console.log(changes[0]);

          const data = NodeDataSchema.parse(item.data);

          if (node && item) {
            setNode({
              ...node,
              data,
            });
          }
        }
        return applyNodeChanges(changes, prev) as WorkflowNode[];
      });

      if (changes[0]?.type === "position") return;

      setTimeout(() => onSave(), 100);
    },
    [getNode, setNodes],
  );

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    if (focus) return;

    setEdges((eds) => applyEdgeChanges(changes, eds) as Edge[]);
    setTimeout(() => onSave(), 100);
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = getNode(connection.source);
      const isIfElse = sourceNode?.data.type === "if-else";

      setEdges((currentEdges) => {
        if (isIfElse) {
          const existingEdges = currentEdges.filter(
            (edge) => edge.source === sourceNode?.id,
          );

          if (existingEdges.length >= 2) return currentEdges;

          const hasEdge = existingEdges.length > 0;
          const condition = hasEdge ? "false" : "true";
          const label = hasEdge ? "is False" : "is True";

          const newEdges = addEdge(
            {
              ...connection,
              type: "custom",
              data: { condition },
              label,
            },
            currentEdges,
          );

          setTimeout(() => onSave(), 100);
          return newEdges;
        }

        const hasExistingConnection = currentEdges.some(
          (edge) => edge.source === sourceNode?.id,
        );

        if (hasExistingConnection) return currentEdges;

        const newEdges = addEdge(
          { ...connection, type: "custom" },
          currentEdges,
        );

        setTimeout(() => onSave(), 100);
        return newEdges;
      });
    },
    [getNode],
  );

  const onNodeDragStop = useCallback((_event: unknown, node: WorkflowNode) => {
    setTimeout(() => {
      setNode(node);
      onSave();
    }, 100);
  }, []);

  const onSelectionChange = useCallback(
    (selection: OnSelectionChangeParams<WorkflowNode, Edge>) => {
      const currentNode = selection.nodes[0];

      if (currentNode) {
        setPanel("node");
        setNode(currentNode);
      }
    },
    [setNode],
  );

  const onSave = async () => {
    await updateWorkflow({
      ...workflow,
      nodes: NodeSchema.array().parse(toObject().nodes),
      edges: EdgeSchema.array().parse(toObject().edges),
    });
  };

  const onPublish = async () => {
    await updateWorkflow({
      ...workflow,
      published: true,
    });
  };

  useEffect(() => {
    const hasTrigger = nodes.find((node) => "isTrigger" in node.data);

    if (!hasTrigger) {
      setPanel("triggers");
    } else if (!panel) {
      setPanel("workflow");
    }
  }, [nodes]);

  return (
    <div className="relative flex h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        defaultEdgeOptions={{
          type: "custom",
        }}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitViewOptions={{
          minZoom: 0.5,
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
        <Controls
          showInteractive={false}
          className="overflow-hidden rounded border"
          style={{
            boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          }}
        />
        <Background />
      </ReactFlow>
      <Sidebar workflow={workflow} />
    </div>
  );
};
