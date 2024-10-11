import Image from "next/image";

type Props = {
  className?: string;
};

export const SignOut = ({ className }: Props) => {
  return (
    <Image
      src="/icons/logout.svg"
      alt="logout_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
