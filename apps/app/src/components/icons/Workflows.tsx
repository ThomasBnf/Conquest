import Image from "next/image";

type Props = {
  className?: string;
};

export const Workflows = ({ className }: Props) => {
  return (
    <Image
      src="/icons/workflows.svg"
      alt="workflows_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
