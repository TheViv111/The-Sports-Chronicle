import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { useTranslation } from "@/contexts/TranslationContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/components/auth/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; // Using sonner for toasts
import logo from "@/assets/logo.png";
import { useIsMobile } from "@/hooks/use-mobile"; // Import the useIsMobile hook

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session } = useSession();
  const isMobile = useIsMobile(); // Use the hook to determine if it's a mobile device

  const navItems = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.blog"), path: "/blog" },
    { name: t("nav.about"), path: "/about" },
    { name: t("nav.admin"), path: "/admin" },
    { name: t("nav.contact"), path: "/contact" },
  ];

  const isActivePage = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blog?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      toast.error(t("auth.signOutError"), {
        description: t("common.tryAgain"),
      });
    } else {
      toast.success(t("auth.signOutSuccess"));
      navigate("/signin"); // Redirect to sign-in page after logout
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
          <img 
            src={logo} 
            alt="The Sports Chronicle" 
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-primary/20" 
          />
          <span className="font-heading text-sm sm:text-xl font-semibold">
            The Sports Chronicle
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActivePage(item.path)
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
          {/* Search */}
          <div className="relative">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <Input
                  placeholder={t("common.search")}
                  className="w-32 sm:w-40 md:w-48 h-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  onBlur={() => {
                    setTimeout(() => setIsSearchOpen(false), 150);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="h-8 w-8 p-0 btn-hover-lift"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Selector - Always visible, adapts to mobile/desktop */}
          <LanguageSelector variant={isMobile ? "mobile" : "desktop"} />

          {/* Auth Buttons / Profile Dropdown */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 rounded-full btn-hover-lift"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.user_metadata?.avatar_url || undefined} alt="User Avatar" />
                    <AvatarFallback>
                      {session.user?.email?.charAt(0).toUpperCase() || <UserIcon className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user?.user_metadata?.display_name || session.user?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>{t("nav.profile")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("nav.signOut")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden lg:flex items-center space-x-2">
              <Link to="/signin">
                <Button variant="ghost" size="sm" className="btn-hover-lift">
                  {t("nav.signIn")}
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="btn-hover-lift">{t("nav.signUp")}</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="group lg:hidden h-8 w-8 p-0 btn-hover-lift btn-hover-glow transition-transform duration-300 hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring tap-press">
                <Menu className="h-4 w-4 icon-hover-twist" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background">
              <div className="flex flex-col space-y-6 mt-8">
                {/* Logo in mobile menu */}
                <div className="flex items-center space-x-3 pb-4 border-b">
                  <img 
                    src={logo} 
                    alt="The Sports Chronicle" 
                    className="h-8 w-8 rounded-full object-cover border-2 border-primary/20" 
                  />
                  <SheetTitle className="font-heading text-lg font-semibold">
                    The Sports Chronicle
                  </SheetTitle>
                </div>

                {/* Navigation */}
                <div className="flex flex-col space-y-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`text-base font-medium link-hover-slide tap-press transition-colors hover:text-primary py-2 px-3 rounded-md ${
                        isActivePage(item.path)
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Auth buttons / Profile for mobile */}
                {session ? (
                  <div className="lg:hidden border-t pt-4 flex flex-col space-y-3">
                    <Link to="/profile">
                      <Button variant="ghost" className="w-full justify-start btn-hover-lift">
                        <UserIcon className="mr-2 h-4 w-4" />
                        {t("nav.profile")}
                      </Button>
                    </Link>
                    <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start btn-hover-lift">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("nav.signOut")}
                    </Button>
                  </div>
                ) : (
                  <div className="lg:hidden border-t pt-4 flex flex-col space-y-3">
                    <Link to="/signin">
                      <Button variant="ghost" className="w-full justify-start btn-hover-lift">
                        {t("nav.signIn")}
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="w-full btn-hover-lift">{t("nav.signUp")}</Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
