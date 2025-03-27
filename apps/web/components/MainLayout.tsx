import { Footer } from "./v1/Footer";
import { MenuBar } from "./v1/menu-mobile";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-dvh flex-col">
      <MenuBar />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
};
