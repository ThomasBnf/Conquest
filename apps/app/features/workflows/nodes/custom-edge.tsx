import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
} from "@xyflow/react";

export const CustomEdge = (props: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath(props);
  const hasCondition = props.data?.condition;

  return (
    <>
      <BaseEdge path={edgePath} />
      {hasCondition && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
            className="custom-edge nodrag nopan"
          >
            {props.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
