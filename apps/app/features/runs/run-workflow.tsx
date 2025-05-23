"use client";

import { PageLayout } from "@/components/layouts/page-layout";
import { IsLoading } from "@/components/states/is-loading";
import { Header } from "@/features/workflows/components/header";
import { useGetSlug } from "@/hooks/useGetSlug";
import { trpc } from "@/server/client";
import { skipToken } from "@tanstack/react-query";
import {
  Background,
  type EdgeProps,
  type NodeProps,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { redirect } from "next/navigation";
import { WorkflowTabs } from "../workflows/components/workflow-tabs";
import { CustomEdge } from "../workflows/nodes/custom-edge";
import { CustomNode } from "../workflows/nodes/custom-node";
import type { WorkflowNode } from "../workflows/panels/schemas/workflow-node.type";
import { RunDetails } from "./run-details";
import { RunHistory } from "./run-history";
import { RunSidebar } from "./run-sidebar";

type Props = {
  workflowId: string;
  runId?: string;
};

const nodeTypes = {
  custom: (props: NodeProps<WorkflowNode>) => <CustomNode {...props} />,
};

const edgeTypes = {
  custom: (props: EdgeProps) => <CustomEdge {...props} />,
};

export const RunWorkflow = ({ workflowId, runId }: Props) => {
  const slug = useGetSlug();
  const { data, isLoading } = trpc.workflows.get.useQuery({ id: workflowId });

  const { data: run } = trpc.runs.get.useQuery(
    runId ? { id: runId } : skipToken,
  );

  if (isLoading) return <IsLoading />;
  if (!data) redirect(`/${slug}/workflows`);

  const { nodes, edges } = data;
  const runNodes = run?.runNodes;

  return (
    <PageLayout>
      <Header workflow={data} />
      <WorkflowTabs workflowId={workflowId} />
      <div className="relative flex h-full">
        <ReactFlow
          nodes={runNodes ?? nodes}
          edges={edges}
          fitViewOptions={{
            minZoom: 0.5,
            maxZoom: 1,
          }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          proOptions={{ hideAttribution: true }}
          fitView
          className="relative"
        >
          <Background />
        </ReactFlow>
        <RunSidebar workflowId={workflowId}>
          {run ? (
            <RunDetails run={run} />
          ) : (
            <RunHistory workflowId={workflowId} />
          )}
        </RunSidebar>
      </div>
    </PageLayout>
  );
};
