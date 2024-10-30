"use client";

import { updateWorkflow } from "@/features/workflows/actions/updateWorkflow";
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
  panel: "workflow" | "trigger" | "action" | "node";
  setPanel: Dispatch<
    SetStateAction<"workflow" | "trigger" | "action" | "node">
  >;
  currentNode: NodeType | undefined;
  setCurrentNode: (node: NodeType | undefined) => void;
  changing: boolean;
  setChanging: Dispatch<SetStateAction<boolean>>;
  onUpdateWorkflow: (updatedWorkflow: Workflow) => Promise<void>;
  onAddNode: (node: NodeType) => void;
  onUpdateNode: (node: NodeType) => void;
  onDeleteNode: () => Promise<string | number | undefined>;
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
  const [panel, setPanel] = useState<
    "workflow" | "trigger" | "action" | "node"
  >("workflow");
  const [currentNode, setCurrentNode] = useState<NodeType | undefined>(
    undefined,
  );
  const [changing, setChanging] = useState(false);

  const onUpdateWorkflow = useCallback(async (updatedWorkflow: Workflow) => {
    setWorkflow(updatedWorkflow);
    const rWorkflow = await updateWorkflow({
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
      setPanel("node");

      const updatedNodes = [...nodes, newNode];
      const parsedNodes = NodeSchema.array().parse(updatedNodes);
      setNodes(updatedNodes);

      if (updatedNodes.length > 1) {
        if (previousNode) {
          const newEdge: Edge = {
            id: `e${previousNode.id}-${newNode.id}`,
            source: previousNode.id,
            target: newNode.id,
            type: "smoothstep",
          };
          const updatedEdges = [...edges, newEdge];
          const parsedEdges = EdgeSchema.array().parse(updatedEdges);
          setEdges(updatedEdges);

          await updateWorkflow({
            id: workflow.id,
            nodes: parsedNodes,
            edges: parsedEdges,
          });
        }
      }

      await updateWorkflow({
        id: workflow.id,
        nodes: parsedNodes,
      });
    },
    [nodes, setNodes, edges, setEdges, workflow.id],
  );

  const onUpdateNode = useCallback(
    async (updatedNode: NodeType) => {
      console.log(updatedNode);
      const updatedNodes = nodes.map((node) => {
        if (node.id === updatedNode.id) {
          return updatedNode;
        }
        return node;
      });

      const parsedNodes = NodeSchema.array().parse(updatedNodes);
      setNodes(parsedNodes);

      const rWorkflow = await updateWorkflow({
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

    const rWorkflow = await updateWorkflow({
      id: workflow.id,
      nodes: parsedNodes,
      edges: parsedEdges,
    });

    if (rWorkflow?.serverError) return toast.error(rWorkflow.serverError);
  }, [nodes, setNodes, currentNode]);

  const handleNodesChange: OnNodesChange = (changes) => {
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
    }
  };

  const handleEdgesChange: OnEdgesChange = (changes) => {
    onEdgesChange(changes);

    for (const change of changes) {
      const { type } = change;

      if (type === "remove") {
        const currentEdge = edges.find((edge) => edge.id === change.id);

        if (currentEdge) {
          updateWorkflow({
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

    updateWorkflow({
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
  }, [nodes]);

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
        currentNode,
        changing,
        setChanging,
        setCurrentNode,
        onUpdateWorkflow,
        onAddNode,
        onUpdateNode,
        onDeleteNode,
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
