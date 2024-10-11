import Image from "next/image";

type Props = {
  className?: string;
};

export const MessagePlus = ({ className }: Props) => {
  return (
    <Image
      src="/icons/message-plus.svg"
      alt="message-plus_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
