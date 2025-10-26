import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation, supportedLanguages, LanguageCode } from "@/contexts/TranslationContext";

interface LanguageSelectorProps {
  variant?: "desktop" | "mobile";
}

export function LanguageSelector({ variant = "desktop" }: LanguageSelectorProps) {
  const { currentLanguage, setLanguage, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  // Organize languages by regions - Default first, then by region
  const languageGroups = {
    "default": {
      en: supportedLanguages.en,
    },
    "indian": {
      hi: supportedLanguages.hi,
      bn: supportedLanguages.bn,
      ta: supportedLanguages.ta,
      te: supportedLanguages.te,
      mr: supportedLanguages.mr,
      gu: supportedLanguages.gu,
    },
    "european": {
      es: supportedLanguages.es,
      fr: supportedLanguages.fr,
      de: supportedLanguages.de,
      it: supportedLanguages.it,
      pt: supportedLanguages.pt,
      ru: supportedLanguages.ru,
      pl: supportedLanguages.pl,
      nl: supportedLanguages.nl,
      sv: supportedLanguages.sv,
      no: supportedLanguages.no,
      da: supportedLanguages.da,
      fi: supportedLanguages.fi,
    },
    "eastAsian": {
      zh: supportedLanguages.zh,
      ja: supportedLanguages.ja,
      ko: supportedLanguages.ko,
    },
    "middleEastern": {
      ar: supportedLanguages.ar,
      he: supportedLanguages.he,
      fa: supportedLanguages.fa,
    },
    "other": {
      tr: supportedLanguages.tr,
      th: supportedLanguages.th,
    },
  };

  // Filter languages based on search query
  const filteredGroups = Object.entries(languageGroups).reduce((acc, [groupName, languages]) => {
    const filteredLanguages = Object.entries(languages).filter(([code, lang]) => {
      const query = searchQuery.toLowerCase();
      return (
        lang.name.toLowerCase().includes(query) ||
        lang.nativeName.toLowerCase().includes(query) ||
        code.toLowerCase().includes(query)
      );
    });

    if (filteredLanguages.length > 0) {
      acc[groupName] = Object.fromEntries(filteredLanguages);
    }
    return acc;
  }, {} as Record<string, Record<string, any>>);

  const handleLanguageSelect = (code: string) => {
    setLanguage(code as LanguageCode);
    setSearchQuery("");
  };

  if (variant === "mobile") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span>{supportedLanguages[currentLanguage].nativeName}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 bg-background border shadow-lg z-50" align="start">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("languages.searchPlaceholder")}
                className="pl-8 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="h-64">
            {Object.entries(filteredGroups).map(([groupName, languages]) => (
              <div key={groupName}>
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase px-2 py-1">
                  {t(`languages.group.${groupName}`)}
                </DropdownMenuLabel>
                {Object.entries(languages).map(([code, lang]) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => handleLanguageSelect(code)}
                    className={`text-sm mx-1 px-2 py-2 rounded-md cursor-pointer hover:bg-accent ${
                      currentLanguage === code ? "bg-accent font-medium" : ""
                    }`}
                  >
                    <span className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {code.toUpperCase()}
                        </span>
                        <span>{lang.nativeName}</span>
                      </div>
                      {currentLanguage === code && (
                        <span className="text-xs bg-foreground text-background px-2 py-1 rounded-full">
                          {t("languages.current")}
                        </span>
                      )}
                    </span>
                  </DropdownMenuItem>
                ))}
                {groupName !== "other" && <DropdownMenuSeparator className="my-1" />}
              </div>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <span className="text-sm">{supportedLanguages[currentLanguage].nativeName}</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-background border shadow-lg z-50">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("languages.searchPlaceholder")}
              className="pl-8 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="h-64">
          {Object.entries(filteredGroups).map(([groupName, languages]) => (
            <div key={groupName}>
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase px-2 py-1">
                {t(`languages.group.${groupName}`)}
              </DropdownMenuLabel>
              {Object.entries(languages).map(([code, lang]) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => handleLanguageSelect(code)}
                  className={`text-sm mx-1 px-2 py-2 rounded-md cursor-pointer hover:bg-accent ${
                    currentLanguage === code ? "bg-accent font-medium" : ""
                  }`}
                >
                  <span className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        {code.toUpperCase()}
                      </span>
                      <span>{lang.nativeName}</span>
                    </div>
                    {currentLanguage === code && (
                      <span className="text-xs bg-foreground text-background px-2 py-1 rounded-full">
                        {t("languages.current")}
                      </span>
                    )}
                  </span>
                </DropdownMenuItem>
              ))}
              {groupName !== "other" && <DropdownMenuSeparator className="my-1" />}
            </div>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}