import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { Duplicate } from "@conquest/ui/icons/Duplicate";
import { SidebarMenuButton, SidebarMenuItem } from "@conquest/ui/sidebar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const DuplicateMenu = () => {
  const { data: session } = useSession();
  const { slug } = session?.user?.workspace ?? {};

  const pathname = usePathname();
  const isActive = pathname.startsWith(`/${slug}/duplicates`);
  const isDuplicatePage = pathname.startsWith(`/${slug}/duplicates`);

  const { data, isLoading } = trpc.duplicate.list.useInfiniteQuery(
    {},
    { getNextPageParam: (_, allPages) => allPages.length * 25 },
  );

  const duplicates = data?.pages.flat();

  if ((isLoading || duplicates?.length === 0) && !isDuplicatePage) return;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip="Duplicates" isActive={isActive}>
        <Link href={`/${slug}/duplicates`} prefetch>
          <Duplicate size={18} />
          <span>Duplicates</span>
          <Badge variant="secondary" className="ml-auto">
            {duplicates?.length}
          </Badge>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
