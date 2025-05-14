"use client";

import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import { SidebarTrigger, useSidebar } from "@conquest/ui/sidebar";
import { X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";

export const HeaderSubPage = ({ children }: PropsWithChildren) => {
  const { open } = useSidebar();
  const router = useRouter();

  const pathname = usePathname();
  const slug = pathname.split("/")[1];

  return (
    <div className="flex min-h-12 shrink-0 items-center justify-between px-4">
      <div className="flex items-center gap-2">
        {!open && (
          <>
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-1 h-4" />
          </>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push(`/${slug}/members`);
            }
          }}
        >
          <X size={16} />
        </Button>
      </div>
      {children}
    </div>
  );
};
