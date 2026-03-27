import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  const location = useLocation();
  const noHeaderFooterPaths = ["/signin", "/signup", "/admin"]; // Paths where header/footer should not appear

  // Scroll to top on route change (with safeguard for lazy loaded routes)
  useEffect(() => {
    // Immediate scroll 
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Delayed scroll just in case React Suspense/lazy loading overwrote the initial position
    const timeout = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 100);
    
    return () => clearTimeout(timeout);
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