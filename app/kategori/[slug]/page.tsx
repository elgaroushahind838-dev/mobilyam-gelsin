"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useParams } from "next/navigation";
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
    price: "19.000 TL",
    priceVal: 19000,
    date: "2024-05-01",
    img: "/images/6k3cmarka-on.jpeg"
  },
  {
    id: 2,
    slug: "sardunya-ranza",
    categorySlug: "genc-odasi",
    tag: "Ranza",
    name: { TR: "Sardunya Ranza", EN: "Artisan Walnut Table", AR: "طاولة أرتيزان جوز" },
    material: "MASİF CEVİZ",
    price: "28.900 TL",
    priceVal: 28900,
    date: "2024-01-15",
    img: "/images/sardunya-ranza-on.jpeg",
  },
  {
    id: 3,
    slug: "surgulu-dolap",
    categorySlug: "yatak-odasi",
    tag: "Gardırop",
    name: { TR: "Sürgülü Dolap", EN: "Lumina TV Unit", AR: "وحدة تلفاز لومينا" },
    material: "FIRÇALI METAL",
    price: "12.200 TL",
    priceVal: 12200,
    date: "2024-04-10",
    img: "/images/surgulu-dolapon.jpeg",
  },
  {
    id: 4,
    slug: "seher-4-kapili-dolap",
    categorySlug: "yatak-odasi",
    tag: "Gardırop",
    name: { TR: "Seher 4 Kapılı Dolap", EN: "Aura Console", AR: "كونسول أورا" },
    material: "MASİF AHŞAP",
    price: "32.000 TL",
    priceVal: 32000,
    date: "2024-03-20",
    img: "/images/seher4kon.jpeg",
  },
  {
    id: 5,
    slug: "3-kapili-dolap",
    categorySlug: "yatak-odasi",
    tag: "Gardırop",
    name: { TR: "3 Kapılı Dolap", EN: "Nova Dining Set", AR: "طاولة طعام نوفا" },
    material: "MASİF AHŞAP",
    price: "45.000 TL",
    priceVal: 45000,
    date: "2024-02-15",
     img: "/images/3kdolap-on.jpeg",
  },
  {
    id: 6,
    slug: "6-kapili-dolap",
    categorySlug: "yatak-odasi",
    tag: "Gardırop",
    name: { TR: "6 Kapılı Dolap", EN: "Luna Bed Base", AR: "قاعدة سرير لونا" },
    material: "MASİF AHŞAP",
    price: "32.000 TL",
    priceVal: 32000,
    date: "2024-03-20",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 7,
    slug: "comfort-yatak",
    categorySlug: "yatak-odasi",
    tag: "Yatak",
    name: { TR: "Comfort Yatak", EN: "Comfort Mattress", AR: "مرتبة كومفورت" },
    material: "ORTHOPEDIC",
    price: "18.000 TL",
    priceVal: 18000,
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
    price: "39.000 TL",
    priceVal: 39000,
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
    price: "8.000 TL",
    priceVal: 8000,
    date: "2024-02-01",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 10,
    slug: "elegance-sifonyer",
    categorySlug: "yatak-odasi",
    tag: "Şifonir",
    name: { TR: "Elegance Şifonyer", EN: "Elegance Dresser", AR: "خزانة إليغانس" },
    material: "MEŞE",
    price: "22.000 TL",
    priceVal: 22000,
    date: "2024-03-05",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 11,
    slug: "bella-makyaj-masasi",
    categorySlug: "yatak-odasi",
    tag: "Makyaj Masası",
    name: { TR: "Bella Makyaj Masası", EN: "Bella Vanity Table", AR: "طاولة مكياج بيلا" },
    material: "MEŞE",
    price: "16.000 TL",
    priceVal: 16000,
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
    price: "27.000 TL",
    priceVal: 27000,
    date: "2024-02-22",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 13,
    slug: "office-calisma-masasi",
    categorySlug: "ofis",
    tag: "Masalar",
    name: { TR: "Office Çalışma Masası", EN: "Office Desk", AR: "مكتب أوفيس" },
    material: "MASİF AHŞAP",
    price: "19.000 TL",
    priceVal: 19000,
    date: "2024-04-20",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 14,
    slug: "modern-portmanto",
    categorySlug: "portmanto",
    tag: "Portmanto",
    name: { TR: "Modern Portmanto", EN: "Modern Coat Rack", AR: "خزانة مدخل مودرن" },
    material: "MEŞE",
    price: "14.000 TL",
    priceVal: 14000,
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
      priceLow: "En Düşük Fiyat",
      priceHigh: "En Yüksek Fiyat",
    },
  },
  EN: {
    anaSayfa: "Home",
    tumUrunler: "All Products",
    baslik: "Timeless Designs",
    gosteriliyor: "PRODUCTS SHOWING",
    sirala: "SORT BY",
    incele: "View Details",
    sortOptions: {
      newest: "Newest",
      oldest: "Oldest",
      priceLow: "Lowest Price",
      priceHigh: "Highest Price",
    },
  },
  AR: {
    anaSayfa: "الرئيسية",
    tumUrunler: "كل المنتجات",
    baslik: "تصاميم خالدة",
    gosteriliyor: "منتج معروض",
    sirala: "ترتيب حسب",
    incele: "عرض التفاصيل",
    sortOptions: {
      newest: "الأحدث",
      oldest: "الأقدم",
      priceLow: "الأقل سعراً",
      priceHigh: "الأعلى سعراً",
    },
  },
};

export default function CategoryPage() {
  const { lang } = useLanguage();
  const t = translations[lang as keyof typeof translations];
  const params = useParams();

  const slug = params?.slug as string;

  const [activeTag, setActiveTag] = useState(ALL_PRODUCTS);
  const [sortBy, setSortBy] = useState("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);

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
    return productsDB.filter((p) => p.categorySlug === slug);
  }, [slug]);

  // UNIQUE TAGS
  const uniqueTags = useMemo(() => {
    return [...new Set(categoryProducts.map((p) => p.tag))];
  }, [categoryProducts]);

  // FILTER + SORT
  const displayedProducts = useMemo(() => {
    const filtered =
      activeTag === ALL_PRODUCTS
        ? [...categoryProducts]
        : categoryProducts.filter((p) => p.tag === activeTag);

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "priceLow":
          return a.priceVal - b.priceVal;
        case "priceHigh":
          return b.priceVal - a.priceVal;
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  }, [activeTag, categoryProducts, sortBy]);

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
        <h1 className="text-5xl md:text-[56px] font-serif text-[#2a241e] mb-12">
          {t.baslik}
        </h1>

        {/* FILTER TAGS */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button
            onClick={() => setActiveTag(ALL_PRODUCTS)}
            className={`px-6 py-2.5 rounded-full text-[14px] font-medium transition-all ${
              activeTag === ALL_PRODUCTS
                ? "bg-[#5a544c] text-white"
                : "bg-[#ece9e4] text-[#5a544c]"
            }`}
          >
            {t.tumUrunler}
          </button>

          {uniqueTags.map((tag) => (
            <button
              key={tag as string}
              onClick={() => setActiveTag(tag as string)}
              className={`px-6 py-2.5 rounded-full text-[14px] font-medium transition-all ${
                activeTag === tag
                  ? "bg-[#5a544c] text-white"
                  : "bg-[#ece9e4] text-[#5a544c]"
              }`}
            >
              {tag as string}
            </button>
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
                  className="bg-[#f4f1eb] rounded-[24px] overflow-hidden flex flex-col group border border-[#e8e4dc] hover:shadow-xl transition-all h-full block cursor-pointer"
                >
                  <div className="relative w-full h-[300px] overflow-hidden">
                    <Image
                      src={urun.img}
                      alt={urun.name[lang as keyof typeof urun.name]}
                      fill
                      className="object-center group-hover:scale-105 transition-transform duration-700"
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
                      <span className="text-[18px] font-bold text-[#2a241e]">
                        {urun.price}
                      </span>

                      {/* الزر الشفاف الجديد */}
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