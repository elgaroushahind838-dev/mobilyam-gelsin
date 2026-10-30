"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronRight, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WHATSAPP_PHONE = "905514835322";

const productsDB = {
  "6-kapili-3-cekmeceli-marka-dolap": {
    price: "19.000 TL",
    categorySlug: "yatak-odasi",
    category: { TR: "Yatak Odası", EN: "Bedroom", AR: "غرفة نوم" },
    subCategory: { TR: "Gardırop", EN: "Wardrobe", AR: "خزانة ملابس" },
    name: { TR: "6 Kapılı 3 Çekmeceli MARKA Dolap", EN: "MARKA Wardrobe with 6 Doors and 3 Drawers", AR: "خزانة ماركا بستة أبواب وثلاثة أدراج" },
    description: {
      TR: "Geniş kullanım alanı ve fonksiyonel tasarımıyla MARKA Dolap, yatak odanızda düzeni ve estetiği bir araya getirerek ferah bir yaşam alanı sunar.",
      EN: "With its spacious storage capacity and functional design, the MARKA Wardrobe combines organization and elegance in your bedroom, creating a comfortable and airy living space.",
      AR: "بفضل مساحته الواسعة وتصميمه العملي، يجمع دولاب MARKA بين التنظيم والأناقة في غرفة نومك، ليمنحك مساحة مريحة وواسعة تضفي شعورًا بالراحة والانسجام."
    },
    images: [
      "/images/6k3cmarka-on.jpeg",
      "/images/6k3cmarka-yaracik.jpeg",
      "/images/6k3cmarka-yan.jpeg",
      "/images/6k3cmarka-ezgialtinsiyah-kulp.jpeg"
    ],
    dimensions: { width: "220 cm", depth: "100 cm", height: "75 cm" },
  },

  "sardunya-ranza": {
    price: "45.000 TL",
    categorySlug: "genc-odasi",
    category: { TR: "Genç Odası", EN: "Bedroom", AR: "غرفة نوم" },
    subCategory: { TR: "Ranza", EN: "Wardrobe", AR: "خزانة ملابس" },
    name: { TR: "Sardunya Ranza", EN: "MARKA Wardrobe with 6 Doors and 3 Drawers", AR: "خزانة ماركا بستة أبواب وثلاثة أدراج" },
    description: {
      TR: "İstanbullu zanaatkarların elinden çıkan Luvia, doğanın en saf halini modern bir formla buluşturuyor. Masif ceviz ayakların mimari duruşu, seçkin İtalyan mermerinin zerafetiyle birleşerek yaşam alanınıza zamansız bir karakter katıyor.",
      EN: "Handcrafted by Istanbul artisans, Luvia brings the purest form of nature together with a modern form. The architectural stance of solid walnut legs combines with the elegance of premium Italian marble.",
      AR: "طاولة لوفيا المصنوعة يدوياً على أيدي حرفيي إسطنبول، تجمع بين أنقى أشكال الطبيعة والتصميم الحديث. الموقف المعماري لأرجل الجوز الصلب يتحد مع أناقة الرخام الإيطالي الفاخر."
    },
    images: [
      "/images/sardunya-ranza-on.jpeg",
      "/images/sardunya-ranza-ust.jpeg",
      "/images/sardunya-ranza-acık.jpeg"
    ],
    dimensions: { width: "220 cm", depth: "100 cm", height: "75 cm" },
  },

  "surgulu-dolap": {
    price: "45.000 TL",
    categorySlug: "yatak-odasi",
    category: { TR: "Yatak Odası", EN: "Bedroom", AR: "غرفة نوم" },
    subCategory: { TR: "Gardırop", EN: "Wardrobe", AR: "خزانة ملابس" },
    name: { TR: "6 Kapılı 3 Çekmeceli MARKA Dolap", EN: "MARKA Wardrobe with 6 Doors and 3 Drawers", AR: "خزانة ماركا بستة أبواب وثلاثة أدراج" },
    description: {
      TR: "İstanbullu zanaatkarların elinden çıkan Luvia, doğanın en saf halini modern bir formla buluşturuyor. Masif ceviz ayakların mimari duruşu, seçkin İtalyan mermerinin zerafetiyle birleşerek yaşam alanınıza zamansız bir karakter katıyor.",
      EN: "Handcrafted by Istanbul artisans, Luvia brings the purest form of nature together with a modern form. The architectural stance of solid walnut legs combines with the elegance of premium Italian marble.",
      AR: "طاولة لوفيا المصنوعة يدوياً على أيدي حرفيي إسطنبول، تجمع بين أنقى أشكال الطبيعة والتصميم الحديث. الموقف المعماري لأرجل الجوز الصلب يتحد مع أناقة الرخام الإيطالي الفاخر."
    },
    images: [
      "/images/surgulu-dolapon.jpeg",
      "/images/surgulu-dolapyan.jpeg",
      "/images/surgulu-dolapacık.jpeg"
    ],
    dimensions: { width: "220 cm", depth: "100 cm", height: "75 cm" },
  },

  "seher-4-kapili-dolap": {
    price: "45.000 TL",
    categorySlug: "yatak-odasi",
    category: { TR: "Yatak Odası", EN: "Bedroom", AR: "غرفة نوم" },
    subCategory: { TR: "Gardırop", EN: "Wardrobe", AR: "خزانة ملابس" },
    name: { TR: "6 Kapılı 3 Çekmeceli MARKA Dolap", EN: "MARKA Wardrobe with 6 Doors and 3 Drawers", AR: "خزانة ماركا بستة أبواب وثلاثة أدراج" },
    description: {
      TR: "İstanbullu zanaatkarların elinden çıkan Luvia, doğanın en sah halini modern bir formla buluşturuyor. Masif ceviz ayakların mimari duruşu, seçkin İtalyan mermerinin zerafetiyle birleşerek yaşam alanınıza zamansız bir karakter katıyor.",
      EN: "Handcrafted by Istanbul artisans, Luvia brings the purest form of nature together with a modern form. The architectural stance of solid walnut legs combines with the elegance of premium Italian marble.",
      AR: "طاولة لوفيا المصنوعة يدوياً على أيدي حرفيي إسطنبول، تجمع بين أنقى أشكال الطبيعة والتصميم الحديث. الموقف المعماري لأرجل الجوز الصلب يتحد مع أناقة الرخام الإيطالي الفاخر."
    },
    images: [
      "/images/seher4kon.jpeg",
      "/images/seher4kyan.jpeg",
      "/images/seher4kacik.jpeg"
    ],
    dimensions: { width: "220 cm", depth: "100 cm", height: "75 cm" },
  },

  "3-kapili-dolap": {
    price: "45.000 TL",
    categorySlug: "yatak-odasi",
    category: { TR: "Yatak Odası", EN: "Bedroom", AR: "غرفة نوم" },
    subCategory: { TR: "Gardırop", EN: "Wardrobe", AR: "خزانة ملابس" },
    name: { TR: "3 Kapılı Dolap", EN: "MARKA Wardrobe with 6 Doors and 3 Drawers", AR: "خزانة ماركا بستة أبواب وثلاثة أدراج" },
    description: {
      TR: "İstanbullu zanaatkarların elinden çıkan Luvia, doğanın en saf halini modern bir formla buluşturuyor. Masif ceviz ayakların mimari duruşu, seçkin İtalyan mermerinin zerafetiyle birleşerek yaşam alanınıza zamansız bir karakter katıyor.",
      EN: "Handcrafted by Istanbul artisans, Luvia brings the purest form of nature together with a modern form. The architectural stance of solid walnut legs combines with the elegance of premium Italian marble.",
      AR: "طاولة لوفيا المصنوعة يدوياً على أيدي حرفيي إسطنبول، تجمع بين أنقى أشكال الطبيعة والتصميم الحديث. الموقف المعماري لأرجل الجوز الصلب يتحد مع أناقة الرخام الإيطالي الفاخر."
    },
    images: [
      "/images/3kdolap-on.jpeg",
      "/images/3kdolap-yan.jpeg",
      "/images/3kdolap-acik.jpeg"
    ],
    dimensions: { width: "220 cm", depth: "100 cm", height: "75 cm" },
  },

  "6-kapili-dolap": {
    price: "45.000 TL",
    categorySlug: "yatak-odasi",
    category: { TR: "Yatak Odası", EN: "Bedroom", AR: "غرفة نوم" },
    subCategory: { TR: "Gardırop", EN: "Wardrobe", AR: "خزانة ملابس" },
    name: { TR: "6 Kapılı Dolap", EN: "MARKA Wardrobe with 6 Doors and 3 Drawers", AR: "خزانة ماركا بستة أبواب وثلاثة أدراج" },
    description: {
      TR: "İstanbullu zanaatkarların elinden çıkan Luvia, doğanın en saf halini modern bir formla buluşturuyor. Masif ceviz ayakların mimari duruşu, seçkin İtalyan mermerinin zerafetiyle birleşerek yaşam alanınıza zamansız bir karakter katıyor.",
      EN: "Handcrafted by Istanbul artisans, Luvia brings the purest form of nature together with a modern form. The architectural stance of solid walnut legs combines with the elegance of premium Italian marble.",
      AR: "طاولة لوفيا المصنوعة يدوياً على أيدي حرفيي إسطنبول، تجمع بين أنقى أشكال الطبيعة والتصميم الحديث. الموقف المعماري لأرجل الجوز الصلب يتحد مع أناقة الرخام İtalyan الفاخر."
    },
    images: [
      "/images/seher4kon.jpeg",
      "/images/seher4kyan.jpeg",
      "/images/seher4kacik.jpeg"
    ],
    dimensions: { width: "220 cm", depth: "100 cm", height: "75 cm" },
  },
};

const copy = {
  TR: {
    home: "Ana Sayfa",
    width: "Genişlik",
    depth: "Derinlik",
    height: "Yükseklik",
    dimensions: "Ölçüler",
    whatsapp: "WhatsApp üzerinden bizimle iletişime geçin",
    message: (name: string) => `Merhaba, ${name} hakkında bilgi almak istiyorum.`,
  },
  EN: {
    home: "Home",
    width: "Width",
    depth: "Depth",
    height: "Height",
    dimensions: "Dimensions",
    whatsapp: "Contact us on WhatsApp",
    message: (name: string) => `Hello, I would like information about ${name}.`,
  },
  AR: {
    home: "الرئيسية",
    width: "العرض",
    depth: "العمق",
    height: "الارتفاع",
    dimensions: "المقاسات",
    whatsapp: "تواصلوا معنا عبر واتساب",
    message: (name: string) => `مرحباً، أود الحصول على معلومات حول ${name}.`,
  },
};

export default function ProductDetailPage() {
  const { lang } = useLanguage();
  const langKey = lang as "TR" | "EN" | "AR";
  const t = copy[langKey];
  const params = useParams();

  const slug = (params.slug as string) || "6-kapili-3-cekmeceli-marka-dolap";
  const product =
    productsDB[slug as keyof typeof productsDB] ||
    productsDB["6-kapili-3-cekmeceli-marka-dolap"];

  const [imageState, setImageState] = useState({ slug, image: product.images[0] });
  const mainImage = imageState.slug === slug ? imageState.image : product.images[0];

  const productName = product.name[langKey];
  const whatsappHref = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(t.message(productName))}`;

  return (
    <main className="min-h-screen bg-[#faf9f6] pt-32 pb-24">
      <div className="max-w-[1300px] mx-auto px-6 md:px-10 mb-8">
        <div className="flex items-center gap-2 text-[12px] md:text-[13px] font-medium text-[#8c7f73]">
          <Link href="/" className="hover:text-[#2a241e] transition-colors">{t.home}</Link>
          <ChevronRight size={14} className="rtl:rotate-180" />
          <Link href={`/kategori/${product.categorySlug}`} className="hover:text-[#2a241e] transition-colors">
            {product.category[langKey]}
          </Link>
          <ChevronRight size={14} className="rtl:rotate-180" />
          <span className="text-[#2a241e] font-bold">{product.subCategory[langKey]}</span>
        </div>
      </div>

      <section className="max-w-[1300px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={mainImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-[350px] md:h-[650px] bg-[#e8e4dc] rounded-[24px] overflow-hidden shadow-sm"
              >
                <img src={mainImage} alt={productName} className="w-full h-full object-contain object-center" />
              </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-3 gap-4">
              {product.images.map((img, index) => (
                <button
                  key={img}
                  type="button"
                  aria-label={`${productName} ${index + 1}`}
                  onClick={() => setImageState({ slug, image: img })}
                  className={`w-full h-[100px] md:h-[140px] rounded-[16px] overflow-hidden transition-all duration-300 ${mainImage === img ? 'ring-2 ring-offset-2 ring-[#2a241e]' : 'opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col pt-2 lg:pt-10">
            <h1 className="text-4xl md:text-[44px] font-serif text-[#2a241e] mb-6 leading-tight">
              {productName}
            </h1>

            <p className="text-[#52525b] text-[15px] md:text-[16px] leading-relaxed mb-8">
              {product.description[langKey]}
            </p>

            <div className="border-t border-b border-[#e5e5e5] py-6 mb-8">
              <span className="text-[11px] font-bold tracking-[0.15em] text-[#8c7f73] uppercase block mb-4">
                {t.dimensions}
              </span>
              <div className="flex justify-between items-center text-[#2a241e]">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#8c7f73] uppercase tracking-wider">{t.width}</span>
                  <span className="text-[15px] font-medium">{product.dimensions.width}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#8c7f73] uppercase tracking-wider">{t.depth}</span>
                  <span className="text-[15px] font-medium">{product.dimensions.depth}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#8c7f73] uppercase tracking-wider">{t.height}</span>
                  <span className="text-[15px] font-medium">{product.dimensions.height}</span>
                </div>
              </div>
            </div>

            <p className="text-3xl font-serif text-[#2a241e] mb-8">{product.price}</p>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-4 text-center text-[14px] font-bold leading-snug text-white shadow-md transition-all hover:bg-[#1ebd5a] min-[400px]:text-[15px] md:text-[16px]"
            >
              <MessageCircle size={18} className="shrink-0" aria-hidden="true" />
              <span className="text-balance">{t.whatsapp}</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
