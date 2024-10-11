import Image from "next/image";

type Props = {
  className?: string;
};

export const UserMinus = ({ className }: Props) => {
  return (
    <Image
      src="/icons/user-minus.svg"
      alt="user-minus_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
