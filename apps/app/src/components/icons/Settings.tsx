import Image from "next/image";

type Props = {
  className?: string;
};

export const Settings = ({ className }: Props) => {
  return (
    <Image
      src="/icons/settings.svg"
      alt="settings_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
