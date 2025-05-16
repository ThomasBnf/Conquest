import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
} from "@xyflow/react";

export const CustomEdge = (props: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath(props);
  const condition = props.data?.condition;

  return (
    <>
      <BaseEdge path={edgePath} />
      {condition && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
            className={`custom-edge edge-${condition} nodrag nopan`}
          >
            {props.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
