"use client";

import { Button } from "@conquest/ui/button";
import { NodeDataSchema } from "@conquest/zod/node.schema";
import type { Workflow } from "@conquest/zod/workflow.schema";
import {
  Background,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  type NodeChange,
  type NodeProps,
  ReactFlow,
  SmoothStepEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MousePointerClick } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { _runWorkflow } from "../actions/_runWorkflow";
import { _updateWorkflow } from "../actions/_updateWorkflow";
import { useChanging } from "../hooks/useChanging";
import { usePanel } from "../hooks/usePanel";
import { useSelected } from "../hooks/useSelected";
import { CustomNode } from "../nodes/custom-node";
import type { WorkflowNode } from "../panels/types/node-data";
import { Sidebar } from "./sidebar";

type Props = {
  workflow: Workflow;
};

const nodeTypes = {
  custom: (props: NodeProps<WorkflowNode>) => <CustomNode {...props} />,
};

const edgesTypes = {
  default: SmoothStepEdge,
};

export const Editor = ({ workflow }: Props) => {
  const { panel, setPanel } = usePanel();
  const { selected, setSelected } = useSelected();
  const { setIsChanging } = useChanging();
  const { toObject, deleteElements, addEdges, updateNodeData, fitView } =
    useReactFlow();

  const [running, setRunning] = useState(false);

  const [nodes, setNodes] = useNodesState<WorkflowNode>(workflow.nodes);
  const [edges, setEdges] = useEdgesState<Edge>(workflow.edges);

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
                setIsChanging(false);
                setSelected(item);
                onSave();
              }, 0);
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
              addEdges([change.item]);
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
        },
      ]);
    },
    [setEdges],
  );

  const onSave = () => {
    _updateWorkflow({
      id: workflow.id,
      nodes: toObject().nodes.map((node) => {
        const data = NodeDataSchema.parse(node.data);
        return {
          id: node.id,
          type: "custom",
          position: node.position,
          data,
        };
      }),
      edges: toObject().edges,
    });
  };

  const hasManualTrigger = useMemo(() => {
    return workflow.published && nodes.some((node) => "isTrigger" in node.data);
  }, [workflow, nodes]);

  const onRunWorkflow = async () => {
    setRunning(true);
    const run = await _runWorkflow({ id: workflow.id });
    const error = run?.serverError;
    const success = run?.data;

    if (error) toast.error(error);
    if (success) toast.success("Workflow successfully run");
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
        edgeTypes={edgesTypes}
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
