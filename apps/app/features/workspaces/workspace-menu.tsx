import { LogOut } from "@/components/icons/LogOut";
import { Settings } from "@/components/icons/Settings";
import { useUser } from "@/context/userContext";
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
  useSidebar,
} from "@conquest/ui/sidebar";
import { ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { logOut } from "../auth/actions/sign-out";

export const WorkspaceMenu = () => {
  const { user } = useUser();
  const { open } = useSidebar();
  const router = useRouter();

  const onLogout = async () => {
    await logOut();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-fit font-medium data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              {open ? user?.workspace.name : user?.workspace.name.charAt(0)}
              <ChevronsUpDown className="!size-3.5" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            <DropdownMenuItem>
              <span className="font-medium">{user?.workspace.name}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/${user?.workspace.slug}/settings`)}
            >
              <Settings className="size-[18px]" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="size-[18px]" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <SidebarTrigger />
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
