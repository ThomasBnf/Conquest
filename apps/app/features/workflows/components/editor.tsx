"use client";

import { Button } from "@conquest/ui/button";
import type { Workflow } from "@conquest/zod/schemas/workflow.schema";
import {
  Background,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  type EdgeProps,
  type NodeChange,
  type NodeProps,
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Loader2, MousePointerClick } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePanel } from "../hooks/usePanel";
import { useSelected } from "../hooks/useSelected";
import { CustomEdge } from "../nodes/custom-edge";
import { CustomNode } from "../nodes/custom-node";
import type { WorkflowNode } from "../panels/schemas/workflow-node.type";
import { Sidebar } from "./sidebar";

type Props = {
  workflow: Workflow;
};

export const Editor = ({ workflow }: Props) => {
  const { panel, setPanel } = usePanel();
  const { selected, setSelected } = useSelected();
  const {
    toObject,
    deleteElements,
    addEdges,
    updateNodeData,
    updateNode,
    fitView,
  } = useReactFlow();

  const [running, setRunning] = useState(false);
  const [nodes, setNodes] = useNodesState<WorkflowNode>(workflow.nodes);
  const [edges, setEdges] = useEdgesState<Edge>(workflow.edges);

  const nodeTypes = useMemo(() => {
    return {
      custom: (props: NodeProps<WorkflowNode>) => (
        <CustomNode hasEdges={hasEdges} {...props} />
      ),
    };
  }, [edges]);

  const edgeTypes = useMemo(() => {
    return {
      custom: (props: EdgeProps) => <CustomEdge {...props} />,
    };
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange<WorkflowNode>[]) => {
      setNodes((prev) => {
        for (const change of changes) {
          switch (change.type) {
            case "add": {
              const { item } = change;

              if (prev.length > 0) {
                setEdges((edges) => [
                  ...edges,
                  {
                    id: `${selected?.id ?? ""}-${item.id}`,
                    source: selected?.id ?? "",
                    target: item.id,
                    type: "custom",
                  },
                ]);
              }

              setTimeout(() => {
                setPanel("node");
                setSelected(item);
                fitView({
                  nodes: [item],
                  duration: 250,
                  padding: 1,
                  maxZoom: 1,
                });
                onSave();
              }, 0);

              break;
            }
            case "replace": {
              const { item } = change;

              updateNodeData(item.id, item.data);

              setTimeout(() => {
                setPanel("node");
                setSelected(item);
                onSave();
              }, 0);
              break;
            }
            case "position": {
              const { position, id } = change;
              updateNode(id, { position });

              setTimeout(() => onSave(), 0);
              break;
            }
            case "remove": {
              const { id } = change;
              const node = nodes.find((node) => node.id === id);

              if (node && "isTrigger" in node.data) return prev;

              deleteElements({ nodes: [{ id }] });
              setTimeout(() => {
                setPanel("workflow");
                setSelected(undefined);
                onSave();
              }, 0);
              break;
            }
          }
        }
        return applyNodeChanges(changes, prev);
      });
    },
    [setNodes, selected],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      setEdges((prev) => {
        for (const change of changes) {
          switch (change.type) {
            case "add": {
              addEdges([{ ...change.item, type: "custom" }]);
              setTimeout(() => onSave(), 0);
              break;
            }
            case "remove": {
              deleteElements({ edges: [{ id: change.id }] });
              setTimeout(() => onSave(), 0);
              break;
            }
          }
        }
        return applyEdgeChanges(changes, prev);
      });
    },
    [setEdges, selected],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      addEdges([
        {
          id: `${params.source}-${params.target}`,
          source: params.source!,
          target: params.target!,
          type: "custom",
        },
      ]);
    },
    [setEdges],
  );

  const onSave = async () => {
    // updateWorkflow({
    //   id: workflow.id,
    //   nodes: toObject().nodes.map((node) => {
    //     const nodeData = NodeDataSchema.or(NodeDataLoopSchema).parse(node.data);
    //     return {
    //       id: node.id,
    //       type: "custom",
    //       position: node.position,
    //       data: nodeData,
    //     };
    //   }) as Node[],
    //   edges: toObject().edges,
    // });
  };

  const hasEdges = useMemo(() => {
    return nodes.filter((node) =>
      edges.find((edge) => edge.source === node.id),
    );
  }, [nodes, edges]);

  const hasManualTrigger = useMemo(() => {
    return (
      workflow.published &&
      nodes.some((node) => node.data.type === "manual-run")
    );
  }, [workflow.published, nodes]);

  const onRunWorkflow = async () => {
    setRunning(true);
    // const run = await runWorkflow({ workflow_id: workflow.id });
    // if (run) toast.success("Workflow successfully run");
    setRunning(false);
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
    <div className="flex h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: "custom",
        }}
        onConnect={onConnect}
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
        {hasManualTrigger && (
          <Button
            onClick={onRunWorkflow}
            className="absolute top-4 right-4 z-50 cursor-pointer"
          >
            {running ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <MousePointerClick size={16} />
                Run workflow
              </>
            )}
          </Button>
        )}
      </ReactFlow>
      <Sidebar />
    </div>
  );
};
