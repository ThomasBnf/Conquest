import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { LogOut } from "@conquest/ui/icons/LogOut";
import { Settings } from "@conquest/ui/icons/Settings";
import { Switch } from "@conquest/ui/icons/Switch";
import { ScrollArea } from "@conquest/ui/scroll-area";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@conquest/ui/sidebar";
import type { Workspace } from "@conquest/zod/schemas/workspace.schema";
import { Check, ChevronsUpDown } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  workspace: Workspace | undefined;
};

export const WorkspaceMenu = ({ workspace }: Props) => {
  const { data: session } = useSession();
  const { id, name } = workspace ?? {};
  const { state } = useSidebar();
  const router = useRouter();

  const { data: workspaces } = trpc.memberInWorkspace.list.useQuery();
  const { mutateAsync } = trpc.users.update.useMutation();

  const onSwitchWorkspace = async (workspace: Workspace) => {
    if (!session?.user) return;

    const { id: workspace_id, slug } = workspace;

    await mutateAsync({
      id: session.user.id,
      workspace_id,
    });

    router.push(`/${slug}`);
  };

  const onSignOut = () => {
    signOut({ redirectTo: "/auth/login" });
  };

  if (state === "collapsed") {
    return (
      <Avatar className="size-8">
        <AvatarImage />
        <AvatarFallback>{name?.[0]}</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-fit font-medium data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              {name}
              <ChevronsUpDown className="!size-3.5" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52" align="start">
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings size={18} />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Switch size={18} className="mr-2" />
                Switch workspace
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="max-h-64">
                <ScrollArea className="h-full">
                  {workspaces?.map((workspace) => (
                    <DropdownMenuItem
                      key={workspace.id}
                      onClick={() => onSwitchWorkspace(workspace)}
                    >
                      {workspace.name}
                      {id === workspace.id && (
                        <Check size={16} className="ml-auto" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut size={18} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <SidebarTrigger />
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
