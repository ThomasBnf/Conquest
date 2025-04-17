import { Footer } from "./v1/Footer";
import { Menu } from "./v1/Menu";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-dvh flex-col">
      <Menu />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
};
