import { BaseEdge, type EdgeProps, getSmoothStepPath } from "@xyflow/react";

export const CustomEdge = (props: EdgeProps) => {
  const [edgePath] = getSmoothStepPath(props);

  return <BaseEdge path={edgePath} />;
};
