import { Link } from "react-router-dom";
import { Youtube, Instagram, Mail } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const sportsCategories = [
    { name: t("category.football"), path: "/blog?category=football" },
    { name: t("category.basketball"), path: "/blog?category=basketball" }
  ];

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-semibold">
              The Sports Chronicle
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex space-x-4">
              <a href="https://www.youtube.com/@SportsChronicleBlog" className="text-muted-foreground hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer"><Youtube className="h-5 w-5" /></a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="mailto:thesportschronicle@outlook.com"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-semibold">{t("footer.quickLinks")}</h3>
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                {t("nav.home")}
              </Link>
              <Link
                to="/blog"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                {t("footer.allPosts")}
              </Link>
              <Link
                to="/about"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                {t("footer.aboutUs")}
              </Link>
              <Link
                to="/contact"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                {t("footer.contact")}
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-semibold">{t("footer.categories")}</h3>
            <div className="flex flex-col space-y-2">
              {sportsCategories.map((category, index) => (
                <Link
                  key={index}
                  to={category.path}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-8">
          <p className="text-muted-foreground text-sm text-center">
            © {currentYear} The Sports Chronicle. {t("footer.rightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

