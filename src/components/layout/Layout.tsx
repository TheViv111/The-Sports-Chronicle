import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  const location = useLocation();
  const noHeaderFooterPaths = ["/signin", "/signup", "/admin"]; // Paths where header/footer should not appear

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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