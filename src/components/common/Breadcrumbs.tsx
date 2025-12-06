import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const getBreadcrumbName = (name: string, index: number) => {
    if (name === "blog" && index === pathnames.length - 1) {
      return "Blog";
    }
    if (name === "blog" && index < pathnames.length - 1) {
      return "Blog";
    }
    if (name === "about") return "About";
    if (name === "contact") return "Contact";
    if (name === "admin") return "Admin";
    if (name === "profile") return "Profile";
    if (name === "signin") return "Sign In";
    if (name === "signup") return "Sign Up";
    
    // For blog posts, format the slug
    if (index > 0 && pathnames[0] === "blog") {
      return name
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const getBreadcrumbUrl = (index: number) => {
    if (index === 0) return "/";
    return `/${pathnames.slice(0, index + 1).join("/")}`;
  };

  if (location.pathname === "/") return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground py-4 px-4 max-w-7xl mx-auto">
      <Link to="/" className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {pathnames.map((name, index) => {
        const route = getBreadcrumbUrl(index);
        const isLast = index === pathnames.length - 1;
        
        return (
          <div key={name} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="text-foreground font-medium">
                {getBreadcrumbName(name, index)}
              </span>
            ) : (
              <Link 
                to={route} 
                className="hover:text-foreground transition-colors"
              >
                {getBreadcrumbName(name, index)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
