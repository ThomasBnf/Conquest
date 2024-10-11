import Image from "next/image";

type Props = {
  className?: string;
};

export const Contacts = ({ className }: Props) => {
  return (
    <Image
      src="/icons/contacts.svg"
      alt="contacts_icon"
      width={24}
      height={24}
      sizes="100%"
      className={className}
    />
  );
};
