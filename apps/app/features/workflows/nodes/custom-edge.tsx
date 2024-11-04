import { BaseEdge, type EdgeProps, getSmoothStepPath } from "@xyflow/react";

export const CustomEdge = (props: EdgeProps) => {
  const [edgePath] = getSmoothStepPath(props);

  return (
    <BaseEdge
      path={edgePath}
      style={{
        strokeWidth: 3,
        stroke: props.selected ? "hsl(257 80% 32%)" : "hsl(240 3% 50%)",
      }}
      {...props}
    />
  );
};
