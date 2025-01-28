"use client";

import { MenuBar } from "@/components/menu-bar";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { CollaborativePlatform } from "./sections/collaborative-platform";
import { CommunityCRM } from "./sections/community-crm";
import { FreeTrial } from "./sections/free-trial";
import { Hero } from "./sections/hero";

export default function Page() {
  return (
    <main className="h-dvh overflow-y-auto">
      <ScrollArea>
        <MenuBar />
        <Hero />
        <CommunityCRM />
        <FreeTrial />
        <CollaborativePlatform />
        <div className="h-[100vh] bg-blue-50" />
      </ScrollArea>
    </main>
  );
}
