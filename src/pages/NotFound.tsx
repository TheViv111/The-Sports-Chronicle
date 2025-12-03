import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { SEO } from "@/components/common/SEO";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEO 
        title="Page Not Found - The Sports Chronicle"
        description="The page you're looking for doesn't exist. Return to The Sports Chronicle homepage for the latest sports news and analysis."
        canonicalUrl="https://the-sports-chronicle.vercel.app/404"
        schemaType="WebPage"
        noindex={true}
      />
      <div className="flex min-h-screen items-center justify-center bg-secondary/20">
        <div className="text-center px-4">
          <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
          <h2 className="mb-4 text-2xl font-semibold">{t("notFound.pageTitle")}</h2>
          <p className="mb-8 text-muted-foreground max-w-md mx-auto">
            The sports page you're looking for doesn't exist. Let's get you back to the action!
          </p>
          <Link to="/">
            <Button size="lg" className="btn-hover-lift">
              <Home className="mr-2 h-4 w-4" />
              {t("notFound.returnHome")}
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;