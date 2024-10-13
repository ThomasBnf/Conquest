import Image from "next/image";

type Props = {
  className?: string;
};

export const UserPlus = ({ className }: Props) => {
  return (
    <Image
      src="/icons/user-plus.svg"
      alt="user-plus_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
