import { MenuBar } from "./menu-mobile";
import { Footer } from "./v1/Footer";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <MenuBar />
      <main>{children}</main>
      <Footer />
    </>
  );
};
