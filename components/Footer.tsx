"use client";
import { type MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../app/context/LanguageContext';
import { Phone, Mail } from 'lucide-react';

const footerTranslations = {
  TR: {
    fHakkimizda: "Modern tasarımın ve geleneksel ustalığın buluşma noktası. İstanbul'daki atölyemizde her parçayı sizin için özenle üretiyoruz.",
    fHizliLinkler: "HIZLI LİNKLER",
    kolBaslik: "Koleksiyonlar",
    fUrunler: "Ürünler",
    fHakkimizdaLink: "Hakkımızda",
    fIletisim: "İletişim",
    fDestek: "DESTEK",
    fGizlilik: "Gizlilik Politikası",
    fWaSiparis: "WhatsApp Sipariş",
    fSosyal: "Sosyal medya",
    fCopy: "© 2026 ATA Istanbul Furniture. Tüm hakları saklıdır."
  },
  EN: {
    fHakkimizda: "The meeting point of modern design and traditional craftsmanship. We carefully produce every piece for you in our Istanbul workshop.",
    fHizliLinkler: "QUICK LINKS",
    kolBaslik: "Collections",
    fUrunler: "Products",
    fHakkimizdaLink: "About Us",
    fIletisim: "Contact",
    fDestek: "SUPPORT",
    fGizlilik: "Privacy Policy",
    fWaSiparis: "WhatsApp Order",
    fSosyal: "Social media",
    fCopy: "© 2026 ATA Istanbul Furniture. All rights reserved."
  },
  AR: {
    fHakkimizda: "نقطة التقاء التصميم الحديث والحرفية التقليدية. ننتج كل قطعة بعناية من أجلك في ورشتنا في إسطنبول.",
    fHizliLinkler: "روابط سريعة",
    kolBaslik: "المجموعات",
    fUrunler: "المنتجات",
    fHakkimizdaLink: "من نحن",
    fIletisim: "اتصل بنا",
    fDestek: "الدعم",
    fGizlilik: "سياسة الخصوصية",
    fWaSiparis: "طلب واتساب",
    fSosyal: "وسائل التواصل الاجتماعي",
    fCopy: "© 2026 أثاث أتا إسطنبول. جميع الحقوق محفوظة."
  }
};

export default function Footer() {
  const { lang, setLang } = useLanguage();
  const pathname = usePathname();
  const t = footerTranslations[lang as keyof typeof footerTranslations];

  const scrollToHomeSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (pathname !== "/") return;
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", `/#${id}`);
  };

  return (
      <footer id="iletisim" className="scroll-mt-28 bg-[#5a544c] text-[#fdfcfb] py-16 md:py-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          <div className="flex flex-col max-w-sm">
            <Link href="/" className="text-3xl font-serif text-white mb-6"> <img 
            src="/images/mobilyamlogo.png" 
            alt="mobilyam"         
          /></Link>
            <p className="text-white/80 text-[15px] leading-relaxed">
              {t.fHakkimizda}
            </p>
          </div>

          <div className="flex flex-col">
            <h4 className="text-[13px] font-bold tracking-[0.15em] text-white/90 uppercase mb-6">
              {t.fHizliLinkler}
            </h4>
            <div className="flex flex-col gap-4">
              <Link href="/#koleksiyonlar" scroll={false} onClick={(event) => scrollToHomeSection(event, "koleksiyonlar")} className="text-white/80 hover:text-white transition-colors text-[15px] w-fit">{t.kolBaslik}</Link>
              <Link href="#" className="text-white/80 hover:text-white transition-colors text-[15px] w-fit">{t.fUrunler}</Link>
              <Link href="/#hakkimizda" scroll={false} onClick={(event) => scrollToHomeSection(event, "hakkimizda")} className="text-white/80 hover:text-white transition-colors text-[15px] w-fit">{t.fHakkimizdaLink}</Link>
              <Link href="/#iletisim" scroll={false} onClick={(event) => scrollToHomeSection(event, "iletisim")} className="text-white/80 hover:text-white transition-colors text-[15px] w-fit">{t.fIletisim}</Link>
            </div>
          </div>

          <div className="flex flex-col">
            <h4 className="text-[13px] font-bold tracking-[0.15em] text-white/90 uppercase mb-6">
              {t.fDestek}
            </h4>
            <div className="flex flex-col gap-5">
              <Link href="#" className="text-white/80 hover:text-white transition-colors text-[15px] w-fit">{t.fGizlilik}</Link>
              <a href="https://wa.me/905514835322" target="_blank" rel="noreferrer" className="text-white font-semibold hover:text-white/80 transition-colors text-[15px] w-fit">{t.fWaSiparis}</a>
              <a href="tel:+905514835322" className="flex items-center gap-3 text-white font-bold hover:text-white/80 transition-colors group mt-2 w-fit">
                <Phone size={20} className="text-white/80 group-hover:text-white transition-colors" />
                +90 551 483 53 22
              </a>
              <a href="mobilyam.gelsin1@gmail.com" className="flex items-center gap-3 text-white font-bold hover:text-white/80 transition-colors group w-fit">
                <Mail size={20} className="text-white/80 group-hover:text-white transition-colors" />
                mobilyam.gelsin1@gmail.com
              </a>
            </div>
          </div>

          <div className="flex flex-col">
            <h4 className="text-[15px] text-white mb-6">
              {t.fSosyal}
            </h4>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/mobilyam.gelsin?igsh=b28wd2NvMHQ0OHdn" target="_blank" rel="noreferrer" className="w-[42px] h-[42px] bg-white rounded-xl flex items-center justify-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="ig" x1="2" y1="22" x2="22" y2="2">
                      <stop offset="0%" stopColor="#fd5949" />
                      <stop offset="50%" stopColor="#d6249f" />
                      <stop offset="100%" stopColor="#285AEB" />
                    </linearGradient>
                  </defs>
                  <path d="M7 2C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2H7ZM7 4H17C18.6569 4 20 5.34315 20 7V17C20 18.6569 18.6569 20 17 20H7C5.34315 20 4 18.6569 4 17V7C4 5.34315 5.34315 4 7 4ZM17 5.5C16.1716 5.5 15.5 6.17157 15.5 7C15.5 7.82843 16.1716 8.5 17 8.5C17.8284 8.5 18.5 7.82843 18.5 7C18.5 6.17157 17.8284 5.5 17 5.5ZM12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7ZM12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9Z" fill="url(#ig)"/>
                </svg>
              </a>

              <a href="https://wa.me/905514835322" target="_blank" rel="noreferrer" className="w-[42px] h-[42px] bg-white rounded-xl flex items-center justify-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 48 48" fill="none">
<path d="M0 48L3.374 35.674C1.292 32.066 0.198 27.976 0.2 23.782C0.206 10.67 10.876 0 23.986 0C30.348 0.002 36.32 2.48 40.812 6.976C45.302 11.472 47.774 17.448 47.772 23.804C47.766 36.918 37.096 47.588 23.986 47.588C20.006 47.586 16.084 46.588 12.61 44.692L0 48ZM13.194 40.386C16.546 42.376 19.746 43.568 23.978 43.57C34.874 43.57 43.75 34.702 43.756 23.8C43.76 12.876 34.926 4.02 23.994 4.016C13.09 4.016 4.22 12.884 4.216 23.784C4.214 28.234 5.518 31.566 7.708 35.052L5.71 42.348L13.194 40.386ZM35.968 29.458C35.82 29.21 35.424 29.062 34.828 28.764C34.234 28.466 31.312 27.028 30.766 26.83C30.222 26.632 29.826 26.532 29.428 27.128C29.032 27.722 27.892 29.062 27.546 29.458C27.2 29.854 26.852 29.904 26.258 29.606C25.664 29.308 23.748 28.682 21.478 26.656C19.712 25.08 18.518 23.134 18.172 22.538C17.826 21.944 18.136 21.622 18.432 21.326C18.7 21.06 19.026 20.632 19.324 20.284C19.626 19.94 19.724 19.692 19.924 19.294C20.122 18.898 20.024 18.55 19.874 18.252C19.724 17.956 18.536 15.03 18.042 13.84C17.558 12.682 17.068 12.838 16.704 12.82L15.564 12.8C15.168 12.8 14.524 12.948 13.98 13.544C13.436 14.14 11.9 15.576 11.9 18.502C11.9 21.428 14.03 24.254 14.326 24.65C14.624 25.046 18.516 31.05 24.478 33.624C25.896 34.236 27.004 34.602 27.866 34.876C29.29 35.328 30.586 35.264 31.61 35.112C32.752 34.942 35.126 33.674 35.622 32.286C36.118 30.896 36.118 29.706 35.968 29.458Z" fill="#25D366"/>
</svg>
              </a>

              <a href="https://www.tiktok.com/@mobilyam.gelsin?_r=1&_t=ZS-96KfWD7lkV3" target="_blank" rel="noreferrer" className="w-[42px] h-[42px] bg-white rounded-xl flex items-center justify-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 48 48" fill="none">
<path d="M34.353 17.327C37.4397 19.5413 41.2211 20.8442 45.3051 20.8442V12.9573C44.5322 12.9574 43.7613 12.8765 43.0051 12.7158V18.9239C38.9214 18.9239 35.1405 17.621 32.053 15.4068V31.5018C32.053 39.5533 25.5492 46.0799 17.5268 46.0799C14.5334 46.0799 11.7512 45.1717 9.44006 43.6141C12.0779 46.3209 15.7565 48 19.8263 48C27.8492 48 34.3534 41.4734 34.3534 33.4216V17.327H34.353ZM37.1904 9.37002C35.6129 7.64048 34.5772 5.40538 34.353 2.93438V1.91995H32.1735C32.7221 5.06059 34.5934 7.74377 37.1904 9.37002ZM14.5142 37.4356C13.6329 36.2759 13.1566 34.8572 13.1587 33.3985C13.1587 29.7161 16.1336 26.7303 19.8037 26.7303C20.4877 26.7301 21.1675 26.8352 21.8194 27.0428V18.9796C21.0576 18.8748 20.2888 18.8303 19.5203 18.8466V25.1226C18.868 24.9151 18.1878 24.8096 17.5037 24.8103C13.8335 24.8103 10.8589 27.7958 10.8589 31.4787C10.8589 34.0828 12.3458 36.3374 14.5142 37.4356Z" fill="#FF004F"/>
<path d="M32.0529 15.4067C35.1404 17.6209 38.9213 18.9237 43.005 18.9237V12.7156C40.7255 12.2283 38.7075 11.0328 37.1903 9.37002C34.5931 7.74361 32.722 5.06043 32.1733 1.91995H26.4482V33.4213C26.4352 37.0937 23.4655 40.0673 19.8032 40.0673C17.6451 40.0673 15.7279 39.0349 14.5136 37.4356C12.3454 36.3374 10.8585 34.0827 10.8585 31.4789C10.8585 27.7963 13.8331 24.8105 17.5032 24.8105C18.2064 24.8105 18.8842 24.9204 19.5199 25.1228V18.8468C11.6384 19.0102 5.2998 25.473 5.2998 33.4214C5.2998 37.3892 6.87827 40.9861 9.44013 43.6143C11.7513 45.1717 14.5335 46.08 17.5268 46.08C25.5494 46.08 32.0531 39.5531 32.0531 31.5018V15.4067H32.0529Z" fill="black"/>
<path d="M43.0051 12.7156V11.037C40.9495 11.0401 38.9343 10.4624 37.1903 9.36987C38.7342 11.0661 40.7671 12.2357 43.0051 12.7156ZM32.1734 1.91997C32.1211 1.61982 32.0809 1.3177 32.053 1.01443V0H24.148V31.5016C24.1354 35.1735 21.1658 38.1471 17.5033 38.1471C16.428 38.1471 15.4128 37.891 14.5137 37.4358C15.7279 39.0349 17.6452 40.0671 19.8033 40.0671C23.4652 40.0671 26.4354 37.0938 26.4482 33.4214V1.91997H32.1734ZM19.5203 18.8468V17.0598C18.8598 16.9692 18.1938 16.9237 17.5271 16.924C9.50383 16.9239 3 23.4508 3 31.5016C3 36.5491 5.55612 40.9974 9.44034 43.614C6.87848 40.986 5.30002 37.3889 5.30002 33.4213C5.30002 25.473 11.6385 19.0102 19.5203 18.8468Z" fill="#00F2EA"/>
</svg>
              </a>

              <a href="https://www.facebook.com/share/18ZELEptXD/" target="_blank" rel="noreferrer" className="w-[42px] h-[42px] bg-white rounded-xl flex items-center justify-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 32 32" fill="none">
<g clipPath="url(#clip0_67_1801)">
<path d="M32 16C32 23.9862 26.1488 30.6056 18.5 31.8056V20.625H22.2281L22.9375 16H18.5V12.9987C18.5 11.7331 19.12 10.5 21.1075 10.5H23.125V6.5625C23.125 6.5625 21.2938 6.25 19.5431 6.25C15.8888 6.25 13.5 8.465 13.5 12.475V16H9.4375V20.625H13.5V31.8056C5.85125 30.6056 0 23.9862 0 16C0 7.16375 7.16375 0 16 0C24.8363 0 32 7.16375 32 16Z" fill="#1877F2"/>
<path d="M22.2281 20.625L22.9375 16H18.5V12.9987C18.5 11.7334 19.1199 10.5 21.1074 10.5H23.125V6.5625C23.125 6.5625 21.294 6.25 19.5434 6.25C15.8887 6.25 13.5 8.465 13.5 12.475V16H9.4375V20.625H13.5V31.8056C14.3146 31.9334 15.1495 32 16 32C16.8505 32 17.6854 31.9334 18.5 31.8056V20.625H22.2281Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_67_1801">
<rect width="32" height="32" fill="white"/>
</clipPath>
</defs>
</svg>
              </a>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-[13px] tracking-wide text-center sm:text-left">
            {t.fCopy}
          </p>
          <div className="flex items-center gap-6">
            {(['TR', 'EN', 'AR'] as const).map((l) => (
              <button 
                key={l}
                onClick={() => setLang(l)}
                className={`text-[13px] font-medium transition-colors ${lang === l ? "text-white" : "text-white/50 hover:text-white"}`}
              >
                {l === 'TR' ? 'Türkçe' : l === 'EN' ? 'English' : 'العربية'}
              </button>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}