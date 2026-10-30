"use client";
import { useState, useEffect, type MouseEvent } from 'react';
import Link from 'next/link';
import { ChevronDown, Globe, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../app/context/LanguageContext';

const translations = {
  TR: { koleksiyonlar: "Koleksiyonlar", hakkimizda: "Hakkımızda", iletisim: "İletişim" },
  EN: { koleksiyonlar: "Collections", hakkimizda: "About Us", iletisim: "Contact" },
  AR: { koleksiyonlar: "المجموعات", hakkimizda: "من نحن", iletisim: "اتصل بنا" }
};

const sectionHrefs: Record<string, string> = {
  koleksiyonlar: "/#koleksiyonlar",
  hakkimizda: "/#hakkimizda",
  iletisim: "#iletisim",
};

export default function Navbar() {
  const { lang, setLang } = useLanguage();
  const pathname = usePathname();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const t = translations[lang];

  const handleSectionClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    setIsMenuOpen(false);
    if (pathname !== "/") return;

    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", `/#${id}`);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    /* 🛠️ التعديل هنا: استبدلنا py-5 بـ py-0 لإلغاء الهوامش العلوية والسفلية تماماً */
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 md:px-16 py-3 
      ${scrolled ? "bg-white/95 shadow-sm" : "bg-[#f9f8f4]"}`}>
      
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <div className="py-0 flex items-center"> 
          <img 
            src="/images/mobilyamlogo.png" 
            alt="mobilyam"          
           className="h-15 sm:h-20 md:h-28 lg:h-12 w-auto object-contain transition-all duration-300"
          />
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-10 items-center">
          {Object.entries(t).map(([key, value]) => (
            <Link key={key} href={sectionHrefs[key]} scroll={false} onClick={(event) => handleSectionClick(event, key)}
               className="relative group text-[#4d453e] hover:text-[#ba7e6a] transition-colors duration-300 font-medium text-[15px]">
              {value}
              <span className="absolute left-0 bottom-[-4px] w-full h-[1px] bg-[#ba7e6a] scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              style={{ 
                border: isLangOpen ? '1.5px solid rgba(77, 69, 62, 1)' : '1px solid rgba(186, 181, 176, 1)' 
              }}
              className="px-4 py-2 rounded-xl flex items-center gap-2 bg-transparent text-[#4d453e] transition-all duration-300"
            >
              <Globe size={16} className="opacity-80" />
              <span className="text-sm font-semibold tracking-wide">{lang}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isLangOpen ? 'rotate-180 text-[#4d453e]' : 'text-gray-400'}`} />
            </button>

            {/* Dropdown Menu */}
            {isLangOpen && (
              <div className="absolute right-0 mt-3 bg-[#fdfcfb] border border-[#bab5b0]/30 shadow-xl rounded-xl overflow-hidden min-w-[130px] animate-in fade-in zoom-in duration-200">
                {/* 🛠️ TypeScript hatasını çözmek için 'as const' eklendi */}
                {(['TR', 'EN', 'AR'] as const).map((l) => (
                  <button 
                    key={l} 
                    onClick={() => { setLang(l); setIsLangOpen(false); }}
                    className={`block w-full px-5 py-3 text-left text-[13px] font-medium transition-colors
                      ${lang === l ? "bg-[#4d453e] text-white" : "text-[#4d453e] hover:bg-[#ba7e6a]/10 hover:text-[#ba7e6a]"}`}
                  >
                    {l === 'TR' ? 'Türkçe' : l === 'EN' ? 'English' : 'العربية'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <button className="md:hidden text-[#4d453e]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#f9f8f4] shadow-2xl md:hidden flex flex-col p-8 space-y-6 animate-in slide-in-from-top duration-300">
          {Object.entries(t).map(([key, value]) => (
            <Link key={key} href={sectionHrefs[key]} scroll={false} onClick={(event) => handleSectionClick(event, key)}
              className="text-xl font-medium text-[#4d453e] border-b border-[#bab5b0]/20 pb-2 active:text-[#ba7e6a]">
              {value}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}