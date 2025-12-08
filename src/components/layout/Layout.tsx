import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  const location = useLocation();
  const noHeaderFooterPaths = ["/signin", "/signup", "/admin"]; // Paths where header/footer should not appear

  const shouldRenderHeaderFooter = !noHeaderFooterPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col">
      {shouldRenderHeaderFooter && <Header />}
      <main className={`flex-1 ${shouldRenderHeaderFooter ? "pt-24" : ""}`}>
        <Outlet />
      </main>
      {shouldRenderHeaderFooter && <Footer />}

    </div>
  );
};

export default Layout;