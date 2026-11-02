"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect, useRef } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { TAG_COPY, CATEGORY_COPY } from "@/lib/types";
import { categoryIntro, seoLang } from "@/lib/seo-copy";
import { useParams, useSearchParams } from "next/navigation";
import type { ProductSubtype } from "@/lib/types";
import { ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ALL_PRODUCTS = "all";

// PRODUCTS DATABASE
const productsDB = [
  {
    id: 1,
    slug: "6-kapili-3-cekmeceli-marka-dolap",
    categorySlug: "yatak-odasi",
    tag: "Gardırop",
    name: { TR: "6 Kapılı 3 Çekmeceli MARKA Dolap", EN: "MARKA Wardrobe with 6 Doors and 3 Drawers", AR: "خزانة ماركا بستة أبواب وثلاثة أدراج" },
    material: "Ahşap",
    date: "2024-05-01",
    img: "/images/6k3cmarka-on.jpeg"
  },
  {
    id: 2,
    slug: "sardunya-ranza",
    categorySlug: "genc-odasi",
    tag: "Ranza",
    name: { TR: "Sardunya Ranza", EN: "Sardunya Bunk Bed", AR: "سرير سردونيا بطابقين" },
    material: "MASİF CEVİZ",
    date: "2024-01-15",
    img: "/images/sardunya-ranza-on.jpeg",
  },
  {
    id: 3,
    slug: "surgulu-dolap",
    categorySlug: "yatak-odasi",
    tag: "Gardırop",
    name: { TR: "Sürgülü Dolap", EN: "Sliding-Door Wardrobe", AR: "خزانة بأبواب منزلقة" },
    material: "FIRÇALI METAL",
    date: "2024-04-10",
    img: "/images/surgulu-dolapon.jpeg",
  },
  {
    id: 4,
    slug: "seher-4-kapili-dolap",
    categorySlug: "yatak-odasi",
    tag: "Gardırop",
    name: { TR: "Seher 4 Kapılı Dolap", EN: "Seher 4-Door Wardrobe", AR: "خزانة سحر بأربعة أبواب" },
    material: "MASİF AHŞAP",
    date: "2024-03-20",
    img: "/images/seher4kon.jpeg",
  },
  {
    id: 5,
    slug: "3-kapili-dolap",
    categorySlug: "yatak-odasi",
    tag: "Gardırop",
    name: { TR: "3 Kapılı Dolap", EN: "3-Door Wardrobe", AR: "خزانة بثلاثة أبواب" },
    material: "MASİF AHŞAP",
    date: "2024-02-15",
     img: "/images/3kdolap-on.jpeg",
  },
  {
    id: 6,
    slug: "6-kapili-dolap",
    categorySlug: "yatak-odasi",
    tag: "Gardırop",
    name: { TR: "6 Kapılı Dolap", EN: "6-Door Wardrobe", AR: "خزانة بستة أبواب" },
    material: "MASİF AHŞAP",
    date: "2024-03-20",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 7,
    slug: "comfort-yatak",
    categorySlug: "yatak-odasi",
    tag: "Yatak",
    name: { TR: "Comfort Yatak", EN: "Comfort Bed", AR: "سرير كومفورت" },
    material: "ORTHOPEDIC",
    date: "2024-04-01",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 8,
    slug: "royal-gardirop",
    categorySlug: "yatak-odasi",
    tag: "Gardırop",
    name: { TR: "Royal Gardırop", EN: "Royal Wardrobe", AR: "خزانة رويال" },
    material: "MEŞE",
    date: "2024-01-10",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 9,
    slug: "soft-komodin",
    categorySlug: "yatak-odasi",
    tag: "Komodin",
    name: { TR: "Soft Komodin", EN: "Soft Nightstand", AR: "كومودينة سوفت" },
    material: "MEŞE",
    date: "2024-02-01",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 10,
    slug: "elegance-sifonyer",
    categorySlug: "yatak-odasi",
    tag: "Şifonir",
    name: { TR: "Elegance Şifonyer", EN: "Elegance Dresser", AR: "تسريحة إليغانس" },
    material: "MEŞE",
    date: "2024-03-05",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 11,
    slug: "bella-makyaj-masasi",
    categorySlug: "yatak-odasi",
    tag: "Makyaj Masası",
    name: { TR: "Bella Makyaj Masası", EN: "Bella Vanity Table", AR: "طاولة زينة بيلا" },
    material: "MEŞE",
    date: "2024-03-12",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 12,
    slug: "kids-ranza",
    categorySlug: "genc-odasi",
    tag: "Ranza",
    name: { TR: "Kids Ranza", EN: "Kids Bunk Bed", AR: "سرير طابقين للأطفال" },
    material: "AHŞAP",
    date: "2024-02-22",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 13,
    slug: "office-calisma-masasi",
    categorySlug: "ofis",
    tag: "Masalar",
    name: { TR: "Office Çalışma Masası", EN: "Office Desk", AR: "مكتب للعمل" },
    material: "MASİF AHŞAP",
    date: "2024-04-20",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 14,
    slug: "modern-portmanto",
    categorySlug: "portmanto",
    tag: "Portmanto",
    name: { TR: "Modern Portmanto", EN: "Modern Hall Stand", AR: "وحدة مدخل حديثة" },
    material: "MEŞE",
    date: "2024-05-10",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
];

// TRANSLATIONS
const translations = {
  TR: {
    anaSayfa: "Ana Sayfa",
    tumUrunler: "Tüm Ürünler",
    baslik: "Zamansız Tasarımlar",
    gosteriliyor: "ÜRÜN GÖSTERİLİYOR",
    sirala: "SIRALA",
    incele: "İncele",
    sortOptions: {
      newest: "En Yeniler",
      oldest: "En Eskiler",
    },
  },
  EN: {
    anaSayfa: "Home",
    tumUrunler: "All Products",
    baslik: "Timeless Designs",
    gosteriliyor: "PRODUCTS SHOWN",
    sirala: "SORT BY",
    incele: "View",
    sortOptions: {
      newest: "Newest",
      oldest: "Oldest",
    },
  },
  AR: {
    anaSayfa: "الرئيسية",
    tumUrunler: "كل المنتجات",
    baslik: "تصاميم خالدة",
    gosteriliyor: "منتج معروض",
    sirala: "ترتيب حسب",
    incele: "عرض",
    sortOptions: {
      newest: "الأحدث",
      oldest: "الأقدم",
    },
  },
};

export default function CategoryPage() {
  const { lang } = useLanguage();
  const t = translations[lang as keyof typeof translations];
  const params = useParams();

  const slug = params?.slug as string;

  const searchParams = useSearchParams();
  const activeSubtype = searchParams.get("tur") || ALL_PRODUCTS;
  const [subtypes, setSubtypes] = useState<ProductSubtype[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [catalog, setCatalog] = useState(productsDB);

  useEffect(() => {
    let ignore = false;
    fetch("/api/catalog", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (ignore || !Array.isArray(data?.products)) return;
        setCatalog(data.products.map((product: {
          id: string;
          slug: string;
          categorySlug: string;
          tag: string;
          subtypeSlug?: string | null;
          name: { TR: string; EN: string; AR: string };
          material?: string;
          date: string;
          img: string;
        }) => ({
          id: product.id,
          slug: product.slug,
          categorySlug: product.categorySlug,
          tag: product.tag,
          subtypeSlug: product.subtypeSlug ?? null,
          name: product.name,
          material: product.material || product.tag,
          date: product.date,
          img: product.img,
        })));
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch(`/api/catalog/subtypes?room=${slug}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!ignore && Array.isArray(data?.subtypes)) setSubtypes(data.subtypes);
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, [slug]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // CLOSE DROPDOWN WHEN CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // CATEGORY FILTER
  const categoryProducts = useMemo(() => {
    if (!slug) return [];
    return catalog.filter((p) => p.categorySlug === slug);
  }, [slug, catalog]);

  // FILTER + SORT
  const displayedProducts = useMemo(() => {
    const filtered =
      activeSubtype === ALL_PRODUCTS
        ? [...categoryProducts]
        : categoryProducts.filter((p) => "subtypeSlug" in p && p.subtypeSlug === activeSubtype);

    return filtered.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [activeSubtype, categoryProducts, sortBy]);

  if (!slug) return null;

  return (
    <main className="min-h-screen bg-[#faf9f6] pt-32 pb-24">
      <div className="max-w-[1500px] mx-auto px-6 md:px-16">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#8c7f73] mb-8">
          <Link
            href="/"
            className="hover:text-[#2a241e] transition-colors"
          >
            {t.anaSayfa}
          </Link>

          <ChevronRight
            size={14}
            className={lang === "AR" ? "rotate-180" : ""}
          />

          <span className="text-[#2a241e]">
            {t.tumUrunler}
          </span>
        </div>

        {/* TITLE */}
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8c7f73]">{t.baslik}</p>
        <h1 className="text-5xl md:text-[56px] font-serif text-[#2a241e]">
          {(CATEGORY_COPY[slug as keyof typeof CATEGORY_COPY] ?? { TR: t.baslik, EN: t.baslik, AR: t.baslik })[lang as "TR" | "EN" | "AR"]}
        </h1>
        {categoryIntro(slug, seoLang(lang)) ? (
          <p className="mt-4 mb-12 max-w-3xl text-[16px] leading-relaxed text-[#52525b]">{categoryIntro(slug, seoLang(lang))}</p>
        ) : <div className="mb-12" />}

        {/* FILTER TAGS */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href={`/kategori/${slug}`}
            className={`px-6 py-2.5 rounded-full text-[14px] font-medium transition-all ${
              activeSubtype === ALL_PRODUCTS
                ? "bg-[#5a544c] text-white"
                : "bg-[#ece9e4] text-[#5a544c]"
            }`}
          >
            {t.tumUrunler}
          </Link>

          {subtypes.map((item) => (
            <Link
              key={item.id}
              href={`/kategori/${slug}?tur=${item.slug}`}
              className={`px-6 py-2.5 rounded-full text-[14px] font-medium transition-all ${
                activeSubtype === item.slug
                  ? "bg-[#5a544c] text-white"
                  : "bg-[#ece9e4] text-[#5a544c]"
              }`}
            >
              {item.label[lang === "EN" ? "en" : lang === "AR" ? "ar" : "tr"]}
            </Link>
          ))}
        </div>

        {/* SORTING */}
        <div className="flex justify-between items-center border-b border-[#e5e5e5] pb-4 mb-10">
          <span className="text-[12px] font-bold tracking-[0.1em] text-[#5a544c] uppercase">
            {displayedProducts.length} {t.gosteriliyor}
          </span>

          <div
            ref={dropdownRef}
            className="relative"
          >
            <button
              onClick={() => setIsSortOpen((prev) => !prev)}
              className="text-[13px] font-semibold text-[#2a241e] flex items-center gap-2 hover:text-[#8c7f73] transition-colors"
            >
              {t.sirala}:

              <span className="text-[#8c7f73]">
                {t.sortOptions[sortBy as keyof typeof t.sortOptions]}
              </span>

              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  isSortOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute top-full mt-2 w-52 bg-white shadow-xl rounded-2xl overflow-hidden z-30 border border-[#f0ece6]
                  ${
                    lang === "AR" ? "left-0 text-right" : "right-0 text-left"
                  }`}
                >
                  {Object.entries(t.sortOptions).map(
                    ([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSortBy(key);
                          setIsSortOpen(false);
                        }}
                        className={`w-full px-5 py-3 text-[13px] transition-colors ${
                          sortBy === key
                            ? "bg-[#f9f8f4] text-[#ba7e6a] font-bold"
                            : "text-[#5a544c] hover:bg-[#faf9f6]"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {displayedProducts.map((urun) => (
              <motion.div
                layout
                key={urun.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {/* تم تغليف الكرت بـ Link للذهاب لصفحة التفاصيل */}
                <Link 
                  href={`/urun/${urun.slug}`}
                  data-track-impression={urun.slug}
                  data-track-section="catalog"
                  className="bg-[#f4f1eb] rounded-[24px] overflow-hidden flex flex-col group border border-[#e8e4dc] hover:shadow-xl transition-all h-full block cursor-pointer"
                >
                  <div className="relative w-full h-[300px] overflow-hidden">
                    <Image
                      src={urun.img}
                      alt={urun.name[lang as keyof typeof urun.name]}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-[20px] font-serif text-[#2a241e] mb-1">
                      {urun.name[lang as keyof typeof urun.name]}
                    </h3>

                    <span className="text-[10px] font-bold tracking-[0.15em] text-[#8c7f73] uppercase mb-4">
                      {urun.material}
                    </span>

                    <div className="mt-auto flex flex-col gap-5">
                      <div
                        className="w-full bg-transparent border border-[#2a241e] text-[#2a241e] py-3.5 rounded-[16px] font-bold text-[14px] flex items-center justify-center gap-2 group-hover:bg-[#2a241e] group-hover:text-white transition-colors"
                      >
                        {t.incele}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}