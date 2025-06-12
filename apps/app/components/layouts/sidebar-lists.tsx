import { MenuList } from "@/features/lists/menu-list";
import { useOpenList } from "@/hooks/useOpenList";
import { useWorkspace } from "@/hooks/useWorkspace";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@conquest/ui/sidebar";
import { Skeleton } from "@conquest/ui/skeleton";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const SidebarLists = () => {
  const { slug } = useWorkspace();
  const { setOpen } = useOpenList();
  const pathname = usePathname();

  const { data: lists, isLoading } = trpc.lists.list.useQuery();

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem className="flex h-6 items-center justify-between pr-[5px] pl-0.5">
          <p className="text-xs text-muted-foreground">Lists</p>
          {lists && lists?.length > 0 && (
            <Button
              variant="ghost"
              size="icon_sm"
              onClick={() => setOpen(true)}
            >
              <Plus size={16} />
            </Button>
          )}
        </SidebarMenuItem>
        {isLoading ? (
          <>
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
          </>
        ) : lists?.length === 0 ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="justify-center border-dashed border-border bg-background"
                onClick={() => setOpen(true)}
              >
                <Plus size={16} />
                New List
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SidebarMenu>
            {lists?.map((list) => (
              <SidebarMenuItem key={list.id}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.includes(list.id)}
                  className="pr-1"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/${slug}/lists/${list.id}`}
                      className="flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <p className="text-base">{list.emoji}</p>
                        <p className="truncate">{list.name}</p>
                      </div>
                    </Link>
                    <MenuList list={list} transparent />
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
};
