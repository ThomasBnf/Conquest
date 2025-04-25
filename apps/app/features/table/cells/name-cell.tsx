import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Company } from "@conquest/zod/schemas/company.schema";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Props = {
  company: Company;
};

export const NameCell = ({ company }: Props) => {
  const { data: session } = useSession();
  const { slug } = session?.user.workspace ?? {};
  const { id, name, logoUrl } = company;

  return (
    <Link
      href={`/${slug}/companies/${id}`}
      className="group flex items-center gap-2"
      prefetch
    >
      <Avatar className="size-6">
        <AvatarImage src={logoUrl ?? ""} />
        <AvatarFallback className="text-sm">
          {name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <p className="truncate font-medium group-hover:underline">{name}</p>
    </Link>
  );
};
