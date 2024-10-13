import Image from "next/image";

type Props = {
  className?: string;
};

export const APIKey = ({ className }: Props) => {
  return (
    <Image
      src="/icons/api-key.svg"
      alt="api_key_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
