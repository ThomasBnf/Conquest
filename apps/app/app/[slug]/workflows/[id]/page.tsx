import { PageLayout } from "@/components/layouts/page-layout";
import { _getWorkflow } from "@/features/workflows/actions/_getWorkflow";
import { Editor } from "@/features/workflows/components/editor";
import { Header } from "@/features/workflows/components/header";
import { ReactFlowProvider } from "@xyflow/react";
import { redirect } from "next/navigation";

type Props = {
  params: {
    id: string;
  };
};

export default async function Page({ params: { id } }: Props) {
  const rWorkflow = await _getWorkflow({ id });
  const workflow = rWorkflow?.data;

  if (!workflow) return redirect("/workflows");

  return (
    <PageLayout>
      <Header id={id} />
      <ReactFlowProvider>
        <Editor workflow={workflow} />
      </ReactFlowProvider>
    </PageLayout>
  );
}
