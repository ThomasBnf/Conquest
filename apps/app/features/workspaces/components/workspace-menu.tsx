import { useUser } from "@/context/userContext";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { CaretSortIcon } from "@radix-ui/react-icons";

export const WorkspaceMenu = () => {
  const { user } = useUser();

  return (
    <div className="flex h-10 items-center cursor-pointer rounded-lg hover:border-border border border-transparent hover:shadow-sm gap-2 px-1.5 transition-all hover:bg-background">
      <Avatar className="size-7">
        <AvatarImage src="" />
        <AvatarFallback className="text-sm uppercase">
          {user?.workspace.name.at(0)}
        </AvatarFallback>
      </Avatar>
      <p className="font-medium first-letter:uppercase">
        {user?.workspace.name}
      </p>
      <CaretSortIcon className="size-4 ml-auto" />
    </div>
  );
};
