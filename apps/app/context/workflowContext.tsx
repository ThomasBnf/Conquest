"use client";

import { _updateWorkflow } from "@/features/workflows/actions/_updateWorkflow";
import { EdgeSchema } from "@conquest/zod/edge.schema";
import {
  NodeDataSchema,
  NodeSchema,
  type Node as NodeType,
} from "@conquest/zod/node.schema";
import type { Workflow } from "@conquest/zod/workflow.schema";
import {
  type Connection,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import cuid from "cuid";
import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

type workflowContext = {
  workflow: Workflow;
  setWorkflow: Dispatch<SetStateAction<Workflow>>;
  nodes: Node[];
  setNodes: (nodes: Node[]) => void;
  edges: Edge[];
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  panel: "workflow" | "trigger" | "action";
  setPanel: Dispatch<SetStateAction<"workflow" | "trigger" | "action">>;
  changing: boolean;
  setChanging: Dispatch<SetStateAction<boolean>>;
  currentNode: NodeType | undefined;
  setCurrentNode: (node: NodeType | undefined) => void;
  onUpdateWorkflow: (updatedWorkflow: Workflow) => Promise<void>;
  onAddNode: (node: NodeType) => void;
  onUpdateNode: (node: NodeType) => void;
  onDeleteNode: () => Promise<string | number | undefined>;
  onDeleteEdge: () => Promise<void>;
  handleNodesChange: OnNodesChange;
  handleEdgesChange: OnEdgesChange;
  onConnect: (params: Connection) => void;
};

const workflowContext = createContext<workflowContext>({} as workflowContext);

type Props = {
  currentWorkflow: Workflow;
  children: React.ReactNode;
};

export const WorkflowProvider = ({ currentWorkflow, children }: Props) => {
  const [workflow, setWorkflow] = useState<Workflow>(currentWorkflow);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(workflow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(workflow.edges);
  const [changing, setChanging] = useState(false);
  const [panel, setPanel] = useState<"workflow" | "trigger" | "action">(
    "workflow",
  );
  const [currentNode, setCurrentNode] = useState<NodeType | undefined>(
    undefined,
  );

  const onUpdateWorkflow = useCallback(async (updatedWorkflow: Workflow) => {
    setWorkflow(updatedWorkflow);
    const rWorkflow = await _updateWorkflow({
      id: workflow.id,
      name: updatedWorkflow.name,
      description: updatedWorkflow.description,
    });
    const error = rWorkflow?.serverError;
    if (error) toast.error(error);
  }, []);

  const onAddNode = useCallback(
    async (node: NodeType) => {
      const previousNode = nodes.at(-1);

      const newNode: NodeType = {
        ...node,
        id: cuid(),
        position: {
          x: 0,
          y: previousNode ? previousNode.position.y + 150 : 0,
        },
        type: "custom",
      };

      setCurrentNode(newNode);

      const updatedNodes = [...nodes, newNode];
      const parsedNodes = NodeSchema.array().parse(updatedNodes);
      setNodes(updatedNodes);

      if (updatedNodes.length > 1) {
        if (previousNode) {
          const newEdge: Edge = {
            id: `${previousNode.id}-${newNode.id}`,
            source: previousNode.id,
            target: newNode.id,
            type: "smoothstep",
          };
          const updatedEdges = [...edges, newEdge];
          const parsedEdges = EdgeSchema.array().parse(updatedEdges);
          setEdges(updatedEdges);

          await _updateWorkflow({
            id: workflow.id,
            nodes: parsedNodes,
            edges: parsedEdges,
          });
        }
      }

      await _updateWorkflow({
        id: workflow.id,
        nodes: parsedNodes,
      });
    },
    [nodes, setNodes, edges, setEdges, workflow.id],
  );

  const onUpdateNode = useCallback(
    async (updatedNode: NodeType) => {
      const updatedNodes = nodes.map((node) => {
        if (node.id === updatedNode.id) {
          return updatedNode;
        }
        return node;
      });

      const parsedNodes = NodeSchema.array().parse(updatedNodes);
      setNodes(parsedNodes);

      const rWorkflow = await _updateWorkflow({
        id: workflow.id,
        nodes: parsedNodes,
      });

      if (rWorkflow?.serverError) return toast.error(rWorkflow.serverError);
    },
    [nodes, setNodes, workflow.id],
  );

  const onDeleteNode = useCallback(async () => {
    const updatedNodes = nodes.filter((node) => node.id !== currentNode?.id);
    const updatedEdges = edges.filter(
      (edge) =>
        edge.source !== currentNode?.id && edge.target !== currentNode?.id,
    );

    const parsedNodes = NodeSchema.array().parse(updatedNodes);
    const parsedEdges = EdgeSchema.array().parse(updatedEdges);

    setNodes(parsedNodes);
    setEdges(parsedEdges);
    setCurrentNode(undefined);

    const rWorkflow = await _updateWorkflow({
      id: workflow.id,
      nodes: parsedNodes,
      edges: parsedEdges,
    });

    if (rWorkflow?.serverError) return toast.error(rWorkflow.serverError);
  }, [nodes, setNodes, currentNode]);

  const onDeleteEdge = useCallback(async () => {
    const updatedEdges = edges.filter((e) => e.source !== currentNode?.id);
    const parsedEdges = EdgeSchema.array().parse(updatedEdges);

    setEdges(parsedEdges);

    await _updateWorkflow({
      id: workflow.id,
      edges: parsedEdges,
    });
  }, [edges, workflow, currentNode]);

  const handleNodesChange: OnNodesChange = (changes) => {
    if (currentNode?.data.type.startsWith("trigger")) return;

    onNodesChange(changes);

    for (const change of changes) {
      if (change.type === "position" && change.position && !change.dragging) {
        const { id, position } = change;
        const currentNode = nodes.find((node) => node.id === id);
        const { x, y } = position;

        const parsedNode = NodeSchema.parse(currentNode);

        if (!Number.isNaN(x) && !Number.isNaN(y)) {
          onUpdateNode({
            ...parsedNode,
            position: { x, y },
          });
        }
      }
      if (change.type === "remove") {
        onDeleteNode();
      }
    }
  };

  const handleEdgesChange: OnEdgesChange = (changes) => {
    onEdgesChange(changes);

    for (const change of changes) {
      const { type } = change;

      if (type === "remove") {
        const currentEdge = edges.find((edge) => edge.id === change.id);

        if (currentEdge) {
          _updateWorkflow({
            id: workflow.id,
            nodes: workflow.nodes,
            edges: workflow.edges.filter((edge) => edge.id !== currentEdge.id),
          });
        }
      }
    }
  };

  const onConnect = (params: Connection) => {
    const newEdge: Edge = {
      id: `${params.source}-${params.target}`,
      source: params.source!,
      target: params.target!,
      type: "smoothstep",
    };

    setEdges((prev) => [...prev, newEdge]);

    const parsedEdge = EdgeSchema.parse(newEdge);

    _updateWorkflow({
      id: workflow.id,
      nodes: workflow.nodes,
      edges: [...workflow.edges, parsedEdge],
    });
  };

  useEffect(() => {
    const hasTrigger = nodes.some((node) => {
      const { type } = NodeDataSchema.parse(node.data);
      return type.startsWith("trigger");
    });

    if (!hasTrigger) setPanel("trigger");
  }, [workflow]);

  return (
    <workflowContext.Provider
      value={{
        workflow,
        setWorkflow,
        nodes,
        setNodes,
        edges,
        setEdges,
        onNodesChange,
        onEdgesChange,
        panel,
        setPanel,
        changing,
        setChanging,
        currentNode,
        setCurrentNode,
        onUpdateWorkflow,
        onAddNode,
        onUpdateNode,
        onDeleteNode,
        onDeleteEdge,
        handleNodesChange,
        handleEdgesChange,
        onConnect,
      }}
    >
      {children}
    </workflowContext.Provider>
  );
};

export const useWorkflow = () => useContext(workflowContext);
