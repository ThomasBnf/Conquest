import { useUser } from "@/context/userContext";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";

export const MenuWorkspace = () => {
  const { user } = useUser();

  return (
    <div className="flex h-12 items-center gap-2 px-2 transition-colors hover:bg-muted">
      <Avatar className="size-7">
        <AvatarImage src="" />
        <AvatarFallback className="bg-neutral-200">
          {user?.workspace.name.at(0)}
        </AvatarFallback>
      </Avatar>
      <p className="font-medium">{user?.workspace.name}</p>
    </div>
  );
};
