import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster as Sonner } from "@/components/ui/sonner"; // Ensure Sonner is here if it's global

const Layout = () => {
  const location = useLocation();
  const noHeaderFooterPaths = ["/signin", "/signup", "/admin"]; // Paths where header/footer should not appear

  const shouldRenderHeaderFooter = !noHeaderFooterPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col">
      {shouldRenderHeaderFooter && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      {shouldRenderHeaderFooter && <Footer />}
      <Sonner /> {/* Global toast provider */}
    </div>
  );
};

export default Layout;