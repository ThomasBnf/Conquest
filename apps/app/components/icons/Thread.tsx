import Image from "next/image";

type Props = {
  className?: string;
};

export const Thread = ({ className }: Props) => {
  return (
    <Image
      src="/icons/thread.svg"
      alt="thread_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
