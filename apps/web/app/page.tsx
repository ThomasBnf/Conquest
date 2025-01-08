import { MenuBar } from "@/components/menu-bar";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Hero } from "./sections/hero";

export default function Page() {
  return (
    <main className="h-dvh overflow-y-auto">
      <ScrollArea>
        <MenuBar />
        <Hero />
        <div className="h-[100vh] bg-blue-50">section</div>
        <div className="h-[100vh] bg-blue-50">section</div>
        <div className="h-[100vh] bg-blue-50">section</div>
        <div className="h-[100vh] bg-blue-50">section</div>
      </ScrollArea>
    </main>
  );
}
