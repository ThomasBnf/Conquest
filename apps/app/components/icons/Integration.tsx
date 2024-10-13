import Image from "next/image";

type Props = {
  className?: string;
};

export const Integration = ({ className }: Props) => {
  return (
    <Image
      src="/icons/integration.svg"
      alt="integration_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
