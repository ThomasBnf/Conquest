import Image from "next/image";

type Props = {
  className?: string;
};

export const User = ({ className }: Props) => {
  return (
    <Image
      src="/icons/user.svg"
      alt="user_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
