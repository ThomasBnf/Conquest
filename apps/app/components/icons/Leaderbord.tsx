import Image from "next/image";

type Props = {
  className?: string;
};

export const LeaderBoard = ({ className }: Props) => {
  return (
    <Image
      src="/icons/leaderboard.svg"
      alt="leaderbord_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
