export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <p>Header</p>
      <main>{children}</main>
      <p>Footer</p>
    </>
  );
};
