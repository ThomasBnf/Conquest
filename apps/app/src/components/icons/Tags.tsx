import Image from "next/image";

type Props = {
  className?: string;
};

export const Tags = ({ className }: Props) => {
  return (
    <Image
      src="/icons/tags.svg"
      alt="tags_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
