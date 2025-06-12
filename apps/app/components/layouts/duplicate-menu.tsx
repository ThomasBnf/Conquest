import { useWorkspace } from "@/hooks/useWorkspace";
import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { Duplicate } from "@conquest/ui/icons/Duplicate";
import { SidebarMenuButton, SidebarMenuItem } from "@conquest/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const DuplicateMenu = () => {
  const { slug } = useWorkspace();

  const pathname = usePathname();
  const isActive = pathname.startsWith(`/${slug}/duplicates`);
  const isDuplicatePage = pathname.startsWith(`/${slug}/duplicates`);

  const { data: count, isLoading } = trpc.duplicate.count.useQuery();

  if (isLoading) return;
  if (count === 0 && !isDuplicatePage) return;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip="Duplicates"
        isActive={isActive}
        className="pr-1"
      >
        <Link href={`/${slug}/duplicates`} prefetch>
          <Duplicate size={18} />
          <span>Duplicates</span>
          <Badge variant="outline" className="ml-auto">
            {count}
          </Badge>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
