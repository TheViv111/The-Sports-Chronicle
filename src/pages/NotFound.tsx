import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "@/contexts/TranslationContext"; // Import useTranslation

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation(); // Use useTranslation hook

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">{t("notFound.pageTitle")}</p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700">
          {t("notFound.returnHome")}
        </a>
      </div>
    </div>
  );
};

export default NotFound;