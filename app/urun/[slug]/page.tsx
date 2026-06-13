"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronRight, CheckCircle2, MessageCircle, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

//  بيانات المنتجات
const productsDB = {
  //id:1 yani ürün1 
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
    stock: { TR: "Stokta Mevcut - 14 iş günü içinde teslimat ve montaj yapılır", EN: "In Stock -Delivery and installation are completed within 14 business days. ", AR: "متوفر بالمخزون يتم التسليم والتركيب خلال 14 يوم عمل" },
    images: [
      "/images/6k3cmarka-on.jpeg", 
      "/images/6k3cmarka-yaracik.jpeg", 
      "/images/6k3cmarka-yan.jpeg",
      "/images/6k3cmarka-ezgialtinsiyah-kulp.jpeg"  
    ],
    dimensions: { width: "220 cm", depth: "100 cm", height: "75 cm" },
    options: [
     { 
  title: { TR: "Kulp Seçimi", EN: "HANDLE SELECTION", AR: "اختيار المقابض" }, 
  items: [
    { color: "#d4af37", label: { TR: "Ezgi Altın Siyah", EN: "Ezgi Gold Black", AR: "إيزغي ذهبي أسود" }, img: "images/ezgi-altin-siyah.jpg" },
    { color: "#c0c0c0", label: { TR: "Ezgi Gümüş", EN: "Ezgi Silver", AR: "إيزغي فضي" }, img: "images/ezgi-gumus.jpg" },
    { color: "#1a1a1a", label: { TR: "Ezgi Siyah", EN: "Ezgi Black", AR: "إيزغي أسود" }, img: "images/ezgi-siyah.jpg" },
    
    { color: "#d4af37", label: { TR: "Halka Altın", EN: "Gold Ring", AR: "حلقة ذهبية" }, img: "images/halka-altin.jpg" },
    { color: "#1a1a1a", label: { TR: "Halka Siyah", EN: "Black Ring", AR: "حلقة سوداء" }, img: "images/halka-siyah.jpg" },
    { color: "#c0c0c0", label: { TR: "Halka Gümüş", EN: "Silver Ring", AR: "حلقة فضية" }, img: "images/halka-gumus.jpg" },
    
    { color: "#b89068", label: { TR: "Bohem", EN: "Boho Wooden", AR: "بوهيمي" }, img: "images/bohem.jpg" },
    { color: "#1a1a1a", label: { TR: "Yuvarlak Siyah", EN: "Round Black", AR: "دائري أسود" }, img: "images/yuvarlak-siyah.jpg" },
    { color: "#1a1a1a", label: { TR: "Kare Siyah", EN: "Square Black", AR: "مربع أسود" }, img: "images/kare-siyah.jpg" },
    { color: "#d4af37", label: { TR: "Kare Altın", EN: "Square Gold", AR: "مربع ذهبي" }, img: "images/kare-altin.jpg" }
  ] 
},
      { 
        title: { TR: "ahşap rengi", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      },
            { 
        title: { TR: "PVS", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      },
      {
         title: { TR: "Kapak", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      },
    ]
  },

  //id:2 yani ürün2
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
    stock: { TR: "Stokta Mevcut - 2 Haftada Teslimat", EN: "In Stock - Delivery in 2 Weeks", AR: "متوفر بالمخزون - تسليم خلال أسبوعين" },
    images: [
      "/images/sardunya-ranza-on.jpeg", 
      "/images/sardunya-ranza-ust.jpeg", 
      "/images/sardunya-ranza-acık.jpeg"  
    ],
    dimensions: { width: "220 cm", depth: "100 cm", height: "75 cm" },
    options: [
      { 
        title: { TR: "AYAK RENGİ", EN: "LEG COLOR", AR: "لون الأرجل" }, 
        items: [
          { color: "#5e4028", label: { TR: "Koyu Ceviz", EN: "Dark Walnut", AR: "جوز غامق" }, img: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=1200&auto=format&fit=crop" },
          { color: "#1a1a1a", label: { TR: "Siyah Meşe", EN: "Black Oak", AR: "بلوط أسود" }, img: "https://images.unsplash.com/photo-1617806118233-18e1c094f094?q=80&w=1200&auto=format&fit=crop" },
          { color: "#f5f5f5", label: { TR: "Doğal Meşe", EN: "Natural Oak", AR: "بلوط طبيعي" }, img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop" }
        ] 
      },
      { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      },
            { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      }
      
    ]
  },
      //id:3 yani ürün3 
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
    stock: { TR: "Stokta Mevcut - 2 Haftada Teslimat", EN: "In Stock - Delivery in 2 Weeks", AR: "متوفر بالمخزون - تسليم خلال أسبوعين" },
    images: [
      "/images/surgulu-dolapon.jpeg", 
      "/images/surgulu-dolapyan.jpeg", 
      "/images/surgulu-dolapacık.jpeg"  
    ],
    dimensions: { width: "220 cm", depth: "100 cm", height: "75 cm" },
    options: [
      { 
        title: { TR: "AYAK RENGİ", EN: "LEG COLOR", AR: "لون الأرجل" }, 
        items: [
          { color: "#5e4028", label: { TR: "Koyu Ceviz", EN: "Dark Walnut", AR: "جوز غامق" }, img: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=1200&auto=format&fit=crop" },
          { color: "#1a1a1a", label: { TR: "Siyah Meşe", EN: "Black Oak", AR: "بلوط أسود" }, img: "https://images.unsplash.com/photo-1617806118233-18e1c094f094?q=80&w=1200&auto=format&fit=crop" },
          { color: "#f5f5f5", label: { TR: "Doğal Meşe", EN: "Natural Oak", AR: "بلوط طبيعي" }, img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop" }
        ] 
      },
      { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      },
            { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      }
      
    ]
    },
        //id:4 yani ürün4
  "seher-4-kapili-dolap": {
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
    stock: { TR: "Stokta Mevcut - 2 Haftada Teslimat", EN: "In Stock - Delivery in 2 Weeks", AR: "متوفر بالمخزون - تسليم خلال أسبوعين" },
    images: [
      "/images/seher4kon.jpeg", 
      "/images/seher4kyan.jpeg", 
      "/images/seher4kacik.jpeg"  
    ],
    dimensions: { width: "220 cm", depth: "100 cm", height: "75 cm" },
    options: [
      { 
        title: { TR: "AYAK RENGİ", EN: "LEG COLOR", AR: "لون الأرجل" }, 
        items: [
          { color: "#5e4028", label: { TR: "Koyu Ceviz", EN: "Dark Walnut", AR: "جوز غامق" }, img: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=1200&auto=format&fit=crop" },
          { color: "#1a1a1a", label: { TR: "Siyah Meşe", EN: "Black Oak", AR: "بلوط أسود" }, img: "https://images.unsplash.com/photo-1617806118233-18e1c094f094?q=80&w=1200&auto=format&fit=crop" },
          { color: "#f5f5f5", label: { TR: "Doğal Meşe", EN: "Natural Oak", AR: "بلوط طبيعي" }, img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop" }
        ] 
      },
      { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      },
            { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      }
      
    ]
    },

     //id:5 yani ürün5
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
    stock: { TR: "Stokta Mevcut - 2 Haftada Teslimat", EN: "In Stock - Delivery in 2 Weeks", AR: "متوفر بالمخزون - تسليم خلال أسبوعين" },
    images: [
      "/images/3kdolap-on.jpeg", 
      "/images/3kdolap-yan.jpeg", 
      "/images/3kdolap-acik.jpeg"  
    ],
    dimensions: { width: "220 cm", depth: "100 cm", height: "75 cm" },
    options: [
      { 
        title: { TR: "AYAK RENGİ", EN: "LEG COLOR", AR: "لون الأرجل" }, 
        items: [
          { color: "#5e4028", label: { TR: "Koyu Ceviz", EN: "Dark Walnut", AR: "جوز غامق" }, img: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=1200&auto=format&fit=crop" },
          { color: "#1a1a1a", label: { TR: "Siyah Meşe", EN: "Black Oak", AR: "بلوط أسود" }, img: "https://images.unsplash.com/photo-1617806118233-18e1c094f094?q=80&w=1200&auto=format&fit=crop" },
          { color: "#f5f5f5", label: { TR: "Doğal Meşe", EN: "Natural Oak", AR: "بلوط طبيعي" }, img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop" }
        ] 
      },
      { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      },
            { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      }
      
    ]
    },

     //id:6 yani ürün6
  "6-kapili-dolap": {
    price: "45.000 TL",
    categorySlug: "yatak-odasi",
    category: { TR: "Yatak Odası", EN: "Bedroom", AR: "غرفة نوم" },
    subCategory: { TR: "Gardırop", EN: "Wardrobe", AR: "خزانة ملابس" },
    name: { TR: "6 Kapılı Dolap", EN: "MARKA Wardrobe with 6 Doors and 3 Drawers", AR: "خزانة ماركا بستة أبواب وثلاثة أدراج" },
    description: {
      TR: "İstanbullu zanaatkarların elinden çıkan Luvia, doğanın en saf halini modern bir formla buluşturuyor. Masif ceviz ayakların mimari duruşu, seçkin İtalyan mermerinin zerafetiyle birleşerek yaşam alanınıza zamansız bir karakter katıyor.",
      EN: "Handcrafted by Istanbul artisans, Luvia brings the purest form of nature together with a modern form. The architectural stance of solid walnut legs combines with the elegance of premium Italian marble.",
      AR: "طاولة لوفيا المصنوعة يدوياً على أيدي حرفيي إسطنبول، تجمع بين أنقى أشكال الطبيعة والتصميم الحديث. الموقف المعماري لأرجل الجوز الصلب يتحد مع أناقة الرخام الإيطالي الفاخر."
    },
    stock: { TR: "Stokta Mevcut - 2 Haftada Teslimat", EN: "In Stock - Delivery in 2 Weeks", AR: "متوفر بالمخزون - تسليم خلال أسبوعين" },
    images: [
      "/images/seher4kon.jpeg", 
      "/images/seher4kyan.jpeg", 
      "/images/seher4kacik.jpeg"  
    ],
    dimensions: { width: "220 cm", depth: "100 cm", height: "75 cm" },
    options: [
      { 
        title: { TR: "AYAK RENGİ", EN: "LEG COLOR", AR: "لون الأرجل" }, 
        items: [
          { color: "#5e4028", label: { TR: "Koyu Ceviz", EN: "Dark Walnut", AR: "جوز غامق" }, img: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=1200&auto=format&fit=crop" },
          { color: "#1a1a1a", label: { TR: "Siyah Meşe", EN: "Black Oak", AR: "بلوط أسود" }, img: "https://images.unsplash.com/photo-1617806118233-18e1c094f094?q=80&w=1200&auto=format&fit=crop" },
          { color: "#f5f5f5", label: { TR: "Doğal Meşe", EN: "Natural Oak", AR: "بلوط طبيعي" }, img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop" }
        ] 
      },
      { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      },
            { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      }
      
    ]
    },

     //id:4 yani ürün4
  "seher-4-kapili-dolap": {
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
    stock: { TR: "Stokta Mevcut - 2 Haftada Teslimat", EN: "In Stock - Delivery in 2 Weeks", AR: "متوفر بالمخزون - تسليم خلال أسبوعين" },
    images: [
      "/images/seher4kon.jpeg", 
      "/images/seher4kyan.jpeg", 
      "/images/seher4kacik.jpeg"  
    ],
    dimensions: { width: "220 cm", depth: "100 cm", height: "75 cm" },
    options: [
      { 
        title: { TR: "AYAK RENGİ", EN: "LEG COLOR", AR: "لون الأرجل" }, 
        items: [
          { color: "#5e4028", label: { TR: "Koyu Ceviz", EN: "Dark Walnut", AR: "جوز غامق" }, img: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=1200&auto=format&fit=crop" },
          { color: "#1a1a1a", label: { TR: "Siyah Meşe", EN: "Black Oak", AR: "بلوط أسود" }, img: "https://images.unsplash.com/photo-1617806118233-18e1c094f094?q=80&w=1200&auto=format&fit=crop" },
          { color: "#f5f5f5", label: { TR: "Doğal Meşe", EN: "Natural Oak", AR: "بلوط طبيعي" }, img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop" }
        ] 
      },
      { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      },
            { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      }
      
    ]
    },

     //id:4 yani ürün4
  "seher-4-kapili-dolap": {
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
    stock: { TR: "Stokta Mevcut - 2 Haftada Teslimat", EN: "In Stock - Delivery in 2 Weeks", AR: "متوفر بالمخزون - تسليم خلال أسبوعين" },
    images: [
      "/images/seher4kon.jpeg", 
      "/images/seher4kyan.jpeg", 
      "/images/seher4kacik.jpeg"  
    ],
    dimensions: { width: "220 cm", depth: "100 cm", height: "75 cm" },
    options: [
      { 
        title: { TR: "AYAK RENGİ", EN: "LEG COLOR", AR: "لون الأرجل" }, 
        items: [
          { color: "#5e4028", label: { TR: "Koyu Ceviz", EN: "Dark Walnut", AR: "جوز غامق" }, img: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=1200&auto=format&fit=crop" },
          { color: "#1a1a1a", label: { TR: "Siyah Meşe", EN: "Black Oak", AR: "بلوط أسود" }, img: "https://images.unsplash.com/photo-1617806118233-18e1c094f094?q=80&w=1200&auto=format&fit=crop" },
          { color: "#f5f5f5", label: { TR: "Doğal Meşe", EN: "Natural Oak", AR: "بلوط طبيعي" }, img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop" }
        ] 
      },
      { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      },
            { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      }
      
    ]
    },

     //id:4 yani ürün4
  "seher-4-kapili-dolap": {
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
    stock: { TR: "Stokta Mevcut - 2 Haftada Teslimat", EN: "In Stock - Delivery in 2 Weeks", AR: "متوفر بالمخزون - تسليم خلال أسبوعين" },
    images: [
      "/images/seher4kon.jpeg", 
      "/images/seher4kyan.jpeg", 
      "/images/seher4kacik.jpeg"  
    ],
    dimensions: { width: "220 cm", depth: "100 cm", height: "75 cm" },
    options: [
      { 
        title: { TR: "AYAK RENGİ", EN: "LEG COLOR", AR: "لون الأرجل" }, 
        items: [
          { color: "#5e4028", label: { TR: "Koyu Ceviz", EN: "Dark Walnut", AR: "جوز غامق" }, img: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=1200&auto=format&fit=crop" },
          { color: "#1a1a1a", label: { TR: "Siyah Meşe", EN: "Black Oak", AR: "بلوط أسود" }, img: "https://images.unsplash.com/photo-1617806118233-18e1c094f094?q=80&w=1200&auto=format&fit=crop" },
          { color: "#f5f5f5", label: { TR: "Doğal Meşe", EN: "Natural Oak", AR: "بلوط طبيعي" }, img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop" }
        ] 
      },
      { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      },
            { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      }
      
    ]
    },

     //id:4 yani ürün4
  "seher-4-kapili-dolap": {
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
    stock: { TR: "Stokta Mevcut - 2 Haftada Teslimat", EN: "In Stock - Delivery in 2 Weeks", AR: "متوفر بالمخزون - تسليم خلال أسبوعين" },
    images: [
      "/images/seher4kon.jpeg", 
      "/images/seher4kyan.jpeg", 
      "/images/seher4kacik.jpeg"  
    ],
    dimensions: { width: "220 cm", depth: "100 cm", height: "75 cm" },
    options: [
      { 
        title: { TR: "AYAK RENGİ", EN: "LEG COLOR", AR: "لون الأرجل" }, 
        items: [
          { color: "#5e4028", label: { TR: "Koyu Ceviz", EN: "Dark Walnut", AR: "جوز غامق" }, img: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=1200&auto=format&fit=crop" },
          { color: "#1a1a1a", label: { TR: "Siyah Meşe", EN: "Black Oak", AR: "بلوط أسود" }, img: "https://images.unsplash.com/photo-1617806118233-18e1c094f094?q=80&w=1200&auto=format&fit=crop" },
          { color: "#f5f5f5", label: { TR: "Doğal Meşe", EN: "Natural Oak", AR: "بلوط طبيعي" }, img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop" }
        ] 
      },
      { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      },
            { 
        title: { TR: "MERMER DESENİ", EN: "MARBLE PATTERN", AR: "شكل الرخام" }, 
        items: [
          { color: "#e0dcd3", label: { TR: "Carrara Beyaz", EN: "Carrara White", AR: "كرارا أبيض" } },
          { color: "#2a2a2a", label: { TR: "Nero Marquina", EN: "Nero Marquina", AR: "نيرو ماركينا" } },
          { color: "#8c7f73", label: { TR: "Emperador", EN: "Emperador", AR: "إمبرادور" } }
        ] 
      }
      
    ]
    },
};

const similarProducts = [
  { id: 1, name: "Luvia Döşemeli Sandalye", price: "8.200 TL", img: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=600&auto=format&fit=crop" },
  { id: 2, name: "Aura Masif Konsol", price: "32.500 TL", img: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=600&auto=format&fit=crop" },
  { id: 3, name: "Petra Yuvarlak Masa", price: "29.000 TL", img: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=600&auto=format&fit=crop" }
];

export default function ProductDetailPage() {
  const { lang } = useLanguage();
  const langKey = lang as "TR" | "EN" | "AR"; 
  const params = useParams();
  
  const slug = (params.slug as string) || "luvia-mermer-masa";
 const product =
  productsDB[slug as keyof typeof productsDB] ||
  productsDB["6-kapili-3-cekmeceli-marka-dolap"];

const [mainImage, setMainImage] = useState(product.images[0]);

   
  
  const initialOptions: { [key: number]: number } = {};
product.options?.forEach((_, idx) => {
  initialOptions[idx] = 0;
});
  const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: number }>(initialOptions);

  const handleOptionSelect = (groupIndex: number, itemIndex: number, imgUrl?: string) => {
    setSelectedOptions(prev => ({ ...prev, [groupIndex]: itemIndex }));
    
    // تغيير الصورة فقط إذا كان في صورة مربوطة باللون
    if (imgUrl) {
      setMainImage(imgUrl);
    }

    // التمرير التلقائي الناعم دائماً عند الضغط على أي لون
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const sendWhatsApp = () => {
    const phoneNumber = "905514835322";
    let text = `Merhaba, bu ürünle ilgileniyorum:\n\n*${product.name[langKey]}*\nFiyat: ${product.price}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const sendConfigToWhatsApp = () => {
    const phoneNumber = "905514835322";
    let text = langKey === 'AR' 
      ? `مرحباً، أود الاستفسار عن هذا المنتج بهذه المواصفات:\n\n*${product.name.AR}*\nالسعر: ${product.price}\n\n*الخيارات التي حددتها:*\n`
      : `Merhaba, şu ürünün konfigürasyonu ile ilgileniyorum:\n\n*${product.name.TR}*\nFiyat: ${product.price}\n\n*Seçimlerim:*\n`;

    product.options.forEach((opt, idx) => {
      const selectedItemIndex = selectedOptions[idx] || 0;
      const selectedLabel = opt.items[selectedItemIndex].label[langKey];
      const title = opt.title[langKey];
      text += `- ${title}: ${selectedLabel}\n`;
    });

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] pt-32 pb-24">
      
      {/* ================= BREADCRUMB ================= */}
      <div className="max-w-[1300px] mx-auto px-6 md:px-10 mb-8">
        <div className="flex items-center gap-2 text-[12px] md:text-[13px] font-medium text-[#8c7f73]">
          <Link href="/" className="hover:text-[#2a241e] transition-colors">{lang === 'AR' ? 'الرئيسية' : 'Ana Sayfa'}</Link>
          <ChevronRight size={14} className="rtl:rotate-180" />
          <Link href={`/kategori/${product.categorySlug}`} className="hover:text-[#2a241e] transition-colors">
            {product.category[langKey]}
          </Link>
          <ChevronRight size={14} className="rtl:rotate-180" />
          <span className="text-[#2a241e] font-bold">{product.subCategory[langKey]}</span>
        </div>
      </div>

      {/* ================= PRODUCT DETAILS ================= */}
      <section className="max-w-[1300px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* الجانب الأيسر: الصور */}
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              <motion.div 
                key={mainImage}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                className="w-full h-[350px] md:h-[650px] bg-[#e8e4dc] rounded-[24px] overflow-hidden shadow-sm"
              >
                <img src={mainImage} alt={product.name[langKey]} className="w-full h-full object-center" />
              </motion.div>
            </AnimatePresence>
            
            {/* الصور الصغيرة */}
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setMainImage(img)}
                  className={`w-full h-[100px] md:h-[140px] rounded-[16px] overflow-hidden transition-all duration-300 ${mainImage === img ? 'ring-2 ring-offset-2 ring-[#2a241e]' : 'opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* الجانب الأيمن: المعلومات */}
          <div className="flex flex-col pt-2 lg:pt-10">
            <h1 className="text-4xl md:text-[44px] font-serif text-[#2a241e] mb-4 leading-tight">
              {product.name[langKey]}
            </h1>
            <p className="text-2xl font-serif text-[#5a544c] mb-8">{product.price}</p>
            
            <p className="text-[#52525b] text-[14px] md:text-[15px] leading-relaxed mb-6">
              {product.description[langKey]}
            </p>

            <div className="flex items-center gap-2 mb-10 text-[#0fa153]">
              <CheckCircle2 size={18} className="fill-[#0fa153] text-white" />
              <span className="text-[12px] font-bold tracking-wide">{product.stock[langKey]}</span>
            </div>

            {/* الخيارات المتغيرة */}
            <div className="flex flex-col gap-6 mb-10">
              {product.options.map((opt, groupIdx) => (
                <div key={groupIdx}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold tracking-[0.15em] text-[#2a241e] uppercase block">
                      {opt.title[langKey]}
                    </span>
                    <span className="text-[11px] font-medium text-[#8c7f73]">
                      {opt.items[selectedOptions[groupIdx]]?.label[langKey]}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {opt.items.map((item, itemIdx) => (
                      <button 
                        key={itemIdx}
                        onClick={() => handleOptionSelect(groupIdx, itemIdx, item.img)}
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-xl transition-all duration-300 border border-[#e5e5e5] ${selectedOptions[groupIdx] === itemIdx ? 'ring-2 ring-offset-2 ring-[#2a241e] scale-105' : 'hover:scale-105'}`}
                        style={{ backgroundColor: item.color }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* الأبعاد */}
            <div className="border-t border-b border-[#e5e5e5] py-6 mb-10 flex justify-between items-center text-[#2a241e]">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-[#8c7f73] uppercase tracking-wider">{langKey === 'AR' ? 'العرض' : 'Genişlik'}</span>
                <span className="text-[15px] font-medium">{product.dimensions.width}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-[#8c7f73] uppercase tracking-wider">{langKey === 'AR' ? 'العمق' : 'Derinlik'}</span>
                <span className="text-[15px] font-medium">{product.dimensions.depth}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-[#8c7f73] uppercase tracking-wider">{langKey === 'AR' ? 'الارتفاع' : 'Yükseklik'}</span>
                <span className="text-[15px] font-medium">{product.dimensions.height}</span>
              </div>
            </div>

            {/* الأزرار */}
            <div className="flex flex-col gap-4">
              <button onClick={sendWhatsApp} className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold text-[13px] tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#1ebd5a] transition-all shadow-md">
                <MessageCircle size={18} /> {langKey === 'AR' ? 'استفسار عبر واتساب' : 'WHATSAPP İLE SİPARİŞ VER'}
              </button>
              
              <button onClick={sendConfigToWhatsApp} className="w-full bg-transparent border border-[#2a241e] text-[#2a241e] py-4 rounded-xl font-bold text-[13px] tracking-widest uppercase hover:bg-[#2a241e] hover:text-white transition-all">
                {langKey === 'AR' ? 'إرسال خياراتي عبر واتساب' : 'TEKNİK DOSYAYI İNDİR (PDF)'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SIMILAR PRODUCTS ================= */}
      <section className="mt-32 max-w-[1300px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-[#2a241e]">
              {langKey === 'AR' ? 'منتجات مشابهة' : 'Benzer Ürünler'}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarProducts.map((prod) => (
  <button
    key={prod.id}
    onClick={() => {
      const phoneNumber = "905514835322";

      const text =
        langKey === "AR"
          ? `مرحباً، أود الاستفسار عن هذا المنتج:\n\n${prod.name}\nالسعر: ${prod.price}`
          : `Merhaba, bu ürünle ilgileniyorum:\n\n${prod.name}\nFiyat: ${prod.price}`;

      window.open(
        `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`,
        "_blank"
      );
    }}
    className="group bg-[#f4f2f0] rounded-[24px] overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border border-[#e8e4dc] text-left"
  >
              <div className="w-full h-[350px] overflow-hidden">
                <img src={prod.img} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6 bg-[#f4f2f0]">
                <h3 className="text-[18px] font-bold text-[#2a241e] mb-1">{prod.name}</h3>
                <p className="text-[14px] text-[#52525b]">{prod.price}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

    </main>
  );
}