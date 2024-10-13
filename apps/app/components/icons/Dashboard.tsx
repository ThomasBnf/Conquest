import Image from "next/image";

type Props = {
  className?: string;
};

export const Dashboard = ({ className }: Props) => {
  return (
    <Image
      src="/icons/dashboard.svg"
      alt="dashboard_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
