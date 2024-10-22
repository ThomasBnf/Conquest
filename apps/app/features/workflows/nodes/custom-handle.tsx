import { Handle, type Position } from "@xyflow/react";

type Props = {
  type: "source" | "target";
  position: Position;
};

export const CustomHandle = ({ type, position }: Props) => {
  return (
    <Handle
      type={type}
      position={position}
      className="!size-3 !border !border-main-500 !bg-background"
    />
  );
};
