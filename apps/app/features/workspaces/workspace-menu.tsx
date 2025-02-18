import { LogOut } from "@/components/icons/LogOut";
import { Settings } from "@/components/icons/Settings";
import { trpc } from "@/server/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@conquest/ui/sidebar";
import type { Workspace } from "@conquest/zod/schemas/workspace.schema";
import { ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  workspace: Workspace | undefined;
};

export const WorkspaceMenu = ({ workspace }: Props) => {
  const { name, slug } = workspace ?? {};
  const router = useRouter();

  const { mutateAsync: signout } = trpc.auth.signout.useMutation({
    onSuccess: () => {
      router.push("/auth/login");
    },
  });

  const onSignOut = async () => await signout();

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
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            <DropdownMenuItem>
              <span className="font-medium">{name}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/${slug}/settings`)}>
              <Settings size={18} />
              Settings
            </DropdownMenuItem>
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
