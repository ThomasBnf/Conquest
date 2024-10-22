import Image from "next/image";

type Props = {
  className?: string;
};

export const Members = ({ className }: Props) => {
  return (
    <Image
      src="/icons/members.svg"
      alt="members_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
