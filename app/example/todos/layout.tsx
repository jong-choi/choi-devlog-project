interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <div className="w-full h-full">{children}</div>;
    </>
  );
};

export default Layout;
