"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import { ChevronRight, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WHATSAPP_PHONE = "905514835322";

const productsDB = {
  "6-kapili-3-cekmeceli-marka-dolap": {
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
  },

  "sardunya-ranza": {
    categorySlug: "genc-odasi",
    category: { TR: "Genç Odası", EN: "Youth Room", AR: "غرفة الشباب" },
    subCategory: { TR: "Ranza", EN: "Bunk Bed", AR: "سرير بطابقين" },
    name: { TR: "Sardunya Ranza", EN: "Sardunya Bunk Bed", AR: "سرير سردونيا بطابقين" },
    description: {
      TR: "Genç odaları için tasarlanan ranza. Güvenli kullanım ve geniş depolama alanı sunar.",
      EN: "A bunk bed designed for youth rooms, with safe use and generous storage.",
      AR: "سرير بطابقين مصمم لغرف الشباب، يجمع بين الاستخدام الآمن ومساحة تخزين واسعة.",
    },
    images: [
      "/images/sardunya-ranza-on.jpeg",
      "/images/sardunya-ranza-ust.jpeg",
      "/images/sardunya-ranza-acık.jpeg"
    ],
  },

  "surgulu-dolap": {
    categorySlug: "yatak-odasi",
    category: { TR: "Yatak Odası", EN: "Bedroom", AR: "غرفة النوم" },
    subCategory: { TR: "Gardırop", EN: "Wardrobe", AR: "خزانة ملابس" },
    name: { TR: "Sürgülü Dolap", EN: "Sliding-Door Wardrobe", AR: "خزانة بأبواب منزلقة" },
    description: {
      TR: "Dar alanlarda kapı açmadan kullanım sağlayan sürgülü gardırop.",
      EN: "A sliding-door wardrobe for narrow rooms, used without swinging the doors open.",
      AR: "خزانة بأبواب منزلقة للمساحات الضيقة، تُستخدم دون الحاجة إلى فتح الأبواب للخارج.",
    },
    images: [
      "/images/surgulu-dolapon.jpeg",
      "/images/surgulu-dolapyan.jpeg",
      "/images/surgulu-dolapacık.jpeg"
    ],
  },

  "seher-4-kapili-dolap": {
    categorySlug: "yatak-odasi",
    category: { TR: "Yatak Odası", EN: "Bedroom", AR: "غرفة نوم" },
    subCategory: { TR: "Gardırop", EN: "Wardrobe", AR: "خزانة ملابس" },
    name: { TR: "Seher 4 Kapılı Dolap", EN: "Seher 4-Door Wardrobe", AR: "خزانة سحر بأربعة أبواب" },
    description: {
      TR: "Dört kapılı Seher dolap, yatak odasında sade bir görünüm ve düzenli depolama sunar.",
      EN: "The four-door Seher wardrobe offers a calm look and tidy storage in the bedroom.",
      AR: "تمنح خزانة سحر ذات الأربعة أبواب مظهراً هادئاً وتخزيناً منظماً في غرفة النوم.",
    },
    images: [
      "/images/seher4kon.jpeg",
      "/images/seher4kyan.jpeg",
      "/images/seher4kacik.jpeg"
    ],
  },

  "3-kapili-dolap": {
    categorySlug: "yatak-odasi",
    category: { TR: "Yatak Odası", EN: "Bedroom", AR: "غرفة نوم" },
    subCategory: { TR: "Gardırop", EN: "Wardrobe", AR: "خزانة ملابس" },
    name: { TR: "3 Kapılı Dolap", EN: "3-Door Wardrobe", AR: "خزانة بثلاثة أبواب" },
    description: {
      TR: "Üç kapılı dolap, daha kompakt odalar için üretilen bir gardırop modelidir.",
      EN: "A three-door wardrobe made for more compact rooms.",
      AR: "خزانة بثلاثة أبواب، تُصنع للغرف الأكثر ضيقاً.",
    },
    images: [
      "/images/3kdolap-on.jpeg",
      "/images/3kdolap-yan.jpeg",
      "/images/3kdolap-acik.jpeg"
    ],
  },

  "6-kapili-dolap": {
    categorySlug: "yatak-odasi",
    category: { TR: "Yatak Odası", EN: "Bedroom", AR: "غرفة نوم" },
    subCategory: { TR: "Gardırop", EN: "Wardrobe", AR: "خزانة ملابس" },
    name: { TR: "6 Kapılı Dolap", EN: "6-Door Wardrobe", AR: "خزانة بستة أبواب" },
    description: {
      TR: "Altı kapılı dolap, geniş aileler için yüksek depolama kapasitesi sunar.",
      EN: "A six-door wardrobe with high storage capacity for larger families.",
      AR: "خزانة بستة أبواب توفر سعة تخزين كبيرة للعائلات.",
    },
    images: [
      "/images/seher4kon.jpeg",
      "/images/seher4kyan.jpeg",
      "/images/seher4kacik.jpeg"
    ],
  },
};

const copy = {
  TR: {
    home: "Ana Sayfa",
    whatsapp: "WhatsApp üzerinden bizimle iletişime geçin",
    message: (name: string) => `Merhaba, ${name} hakkında bilgi almak istiyorum.`,
  },
  EN: {
    home: "Home",
    whatsapp: "Contact us via WhatsApp",
    message: (name: string) => `Hello, I would like information about ${name}.`,
  },
  AR: {
    home: "الرئيسية",
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
  const known = productsDB[slug as keyof typeof productsDB];
  const [remote, setRemote] = useState<{ slug: string; product: typeof known | null; missing: boolean } | null>(null);
  const remoteForSlug = remote?.slug === slug ? remote : null;

  useEffect(() => {
    let ignore = false;
    fetch(`/api/catalog/${slug}`, { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 404) return { missing: true as const };
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (ignore || !data) return;
        if ("missing" in data) {
          setRemote({ slug, product: null, missing: true });
          return;
        }
        const item = data.product;
        setRemote({
          slug,
          missing: false,
          product: {
            categorySlug: item.categorySlug,
            category: item.category ?? { TR: item.categoryLabel, EN: item.categoryLabel, AR: item.categoryLabel },
            subCategory: item.tagLabel ?? { TR: item.tag, EN: item.tag, AR: item.tag },
            name: item.name,
            description: item.description,
            images: item.images?.length ? item.images : [item.img],
          },
        });
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, [slug]);

  const product = remoteForSlug?.product || (remoteForSlug?.missing ? null : known) || null;

  const [imageState, setImageState] = useState({ slug, image: product?.images[0] || "" });
  const mainImage = product && imageState.slug === slug && imageState.image ? imageState.image : product?.images[0] || "";

  if (!product) {
    const missing = Boolean(remoteForSlug?.missing);
    return (
      <main className="min-h-screen bg-[#faf9f6] px-6 pt-32 text-[#2a241e]">
        <h1 className="font-serif text-4xl">{missing ? "Ürün bulunamadı" : "Yükleniyor"}</h1>
        {missing && <Link href="/" className="mt-6 inline-block text-sm font-semibold underline">Ana sayfaya dön</Link>}
      </main>
    );
  }

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
