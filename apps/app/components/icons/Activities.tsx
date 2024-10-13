import Image from "next/image";

type Props = {
  className?: string;
};

export const Activities = ({ className }: Props) => {
  return (
    <Image
      src="/icons/activities.svg"
      alt="activities_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
