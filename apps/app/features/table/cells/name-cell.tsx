import { useWorkspace } from "@/hooks/useWorkspace";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Company } from "@conquest/zod/schemas/company.schema";
import Link from "next/link";

type Props = {
  company: Company;
};

export const NameCell = ({ company }: Props) => {
  const { id, name, logoUrl } = company;
  const { slug } = useWorkspace();

  return (
    <Link
      href={`/${slug}/companies/${id}`}
      className="flex items-center gap-2 truncate group"
      prefetch
    >
      <Avatar className="size-6">
        <AvatarImage src={logoUrl ?? ""} />
        <AvatarFallback className="text-sm">
          {name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <p className="font-medium truncate group-hover:underline">{name}</p>
    </Link>
  );
};
