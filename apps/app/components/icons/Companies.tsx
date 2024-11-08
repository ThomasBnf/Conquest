import Image from "next/image";

type Props = {
  className?: string;
};

export const Companies = ({ className }: Props) => {
  return (
    <Image
      src="/icons/companies.svg"
      alt="companies_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
