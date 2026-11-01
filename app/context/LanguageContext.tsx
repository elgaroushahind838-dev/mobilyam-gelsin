"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

type Language = "TR" | "EN" | "AR";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ initialLang = "TR", children }: { initialLang?: Language; children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(initialLang);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setLangState(initialLang);
  }, [initialLang]);

  useEffect(() => {
    document.documentElement.dir = lang === "AR" ? "rtl" : "ltr";
    document.documentElement.lang = lang.toLowerCase();
  }, [lang]);

  function setLang(next: Language) {
    setLangState(next);
    const params = new URLSearchParams(window.location.search);
    if (next === "TR") params.delete("lang");
    else params.set("lang", next.toLowerCase());
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage error");
  return context;
}