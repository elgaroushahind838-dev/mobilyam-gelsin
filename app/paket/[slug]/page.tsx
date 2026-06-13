"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { CheckCircle2, Layers, Users, ChevronRight, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const packageData = {
  "ekonomik": {
    name: { TR: "Ekonomik Düğün Paketi", EN: "Economic Wedding Package", AR: "باقة الزفاف الاقتصادية" },
    images: {
      bed: ["/images/kutu.jpeg", "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?q=80&w=800&auto=format&fit=crop"],
      sofa: ["https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop"],
      dining: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop"]
    }
  },
  "standart": {
    name: { TR: "Standart Düğün Paketi", EN: "Standard Wedding Package", AR: "باقة الزفاف القياسية" },
    images: {
      bed: ["https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?q=80&w=800&auto=format&fit=crop"],
      sofa: ["https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800&auto=format&fit=crop"],
      dining: ["https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1617806118233-18e1c094f094?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop"]
    }
  },
  "premium": {
    name: { TR: "Premium Düğün Paketi", EN: "Premium Wedding Package", AR: "باقة الزفاف البريميوم" },
    images: {
      bed: ["https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800&auto=format&fit=crop"],
      sofa: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800&auto=format&fit=crop"],
      dining: ["https://images.unsplash.com/photo-1617806118233-18e1c094f094?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1513506003901-1e6a229e9d15?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=800&auto=format&fit=crop"]
    }
  }
};

const translations = {
  TR: {
    anaSayfa: "Ana Sayfa", 
    paketler: "Düğün Paketleri", 
    bolum1Tag: "BÖLÜM 01", 
    bolum1Baslik: "Yatak Odası Takımı", 
    bolum1Aciklama: "Dinginliği yansıtan, fonksiyonel ve zarif parçalar.",
    ahsapSecenek: "AHŞAP SEÇENEKLERİ", 
    kumasDoku: "KUMAŞ DOKUSU", 
    kumaslar: ["BUKLET", "KETEN", "KADİFE"], 
    icerik: ["Karyola (160x200)", "2 Adet Komodin", "6 Kapılı Dolap"], 
    dahil: "Dahil",
    bolum2Tag: "BÖLÜM 02", 
    bolum2Baslik: "Oturma Grubu", 
    bolum2Aciklama: "Konforun en yalın hali, fırınlanmış iskelet yapısı.",
    teknikDetay: "TEKNİK DETAY", 
    olculer: ["Genişlik: 280cm", "Derinlik: 105cm", "Yükseklik: 75cm"], 
    cizimIndir: "SEÇİMLERİMİ WHATSAPP'A GÖNDER",
    bolum3Tag: "BÖLÜM 03", 
    bolum3Baslik: "Yemek Odası", 
    bolum3Aciklama: "Mermer ve masif meşenin kusursuz uyumu.",
    tablaSecimi: "TABLA SEÇİMİ", 
    tablaDetay: "Carrara Mermer veya Doğal Meşe", 
    sandalyeAdedi: "SANDALYE ADEDİ", 
    sandalyeDetay: "6 veya 8 Kişilik Seçenekler", 
    uzmanDestegi: "UZMAN DESTEĞİ", 
    uzmanDetay: "İç mimarlarımız konfigürasyon yapabilir.",
    indirimBaslik: "DÜĞÜN PAKETİNE ÖZEL -20% İNDİRİM", 
    waMesaj: "Merhaba, konfigürasyon detaylarım:"
  },
  EN: {
    anaSayfa: "Home", 
    paketler: "Wedding Packages", 
    bolum1Tag: "PART 01", 
    bolum1Baslik: "Bedroom Set", 
    bolum1Aciklama: "Functional and elegant pieces reflecting serenity.",
    ahsapSecenek: "WOOD OPTIONS", 
    kumasDoku: "FABRIC TEXTURE", 
    kumaslar: ["BOUCLE", "LINEN", "VELVET"], 
    icerik: ["Bed Frame (160x200)", "2 Nightstands", "6-Door Wardrobe"], 
    dahil: "Included",
    bolum2Tag: "PART 02", 
    bolum2Baslik: "Living Room Group", 
    bolum2Aciklama: "The purest form of comfort, kiln-dried frame.",
    teknikDetay: "TECHNICAL DETAILS", 
    olculer: ["Width: 280cm", "Depth: 105cm", "Height: 75cm"], 
    cizimIndir: "SEND SELECTIONS VIA WHATSAPP",
    bolum3Tag: "PART 03", 
    bolum3Baslik: "Dining Room", 
    bolum3Aciklama: "Perfect harmony of marble and solid oak.",
    tablaSecimi: "TABLETOP", 
    tablaDetay: "Carrara Marble or Natural Oak", 
    sandalyeAdedi: "CHAIRS", 
    sandalyeDetay: "6 or 8 Person Options", 
    uzmanDestegi: "EXPERT SUPPORT", 
    uzmanDetay: "Our architects can configure.",
    indirimBaslik: "SPECIAL FOR WEDDING PACKAGE -20% DISCOUNT",
    waMesaj: "Hello, my configuration details:"
  },
  AR: {
    anaSayfa: "الرئيسية", 
    paketler: "باقات الزفاف", 
    bolum1Tag: "الجزء 01", 
    bolum1Baslik: "طقم غرفة النوم", 
    bolum1Aciklama: "قطع عملية وأنيقة تعكس الهدوء والسكينة.",
    ahsapSecenek: "خيارات الخشب", 
    kumasDoku: "ملمس القماش", 
    kumaslar: ["بوكليت", "كتان", "مخمل"], 
    icerik: ["هيكل سرير (160x200)", "2 كومودينو", "خزانة بـ 6 أبواب"], 
    dahil: "متضمن",
    bolum2Tag: "الجزء 02", 
    bolum2Baslik: "طقم الجلوس", 
    bolum2Aciklama: "الراحة بأنقى صورها، وهيكل خشب متين.",
    teknikDetay: "تفاصيل تقنية", 
    olculer: ["العرض: 280 سم", "العمق: 105 سم", "الارتفاع: 75 سم"], 
    cizimIndir: "أرسل خياراتي عبر واتساب",
    bolum3Tag: "الجزء 03", 
    bolum3Baslik: "غرفة الطعام", 
    bolum3Aciklama: "التناغم المثالي بين الرخام والبلوط الصلب.",
    tablaSecimi: "سطح الطاولة", 
    tablaDetay: "رخام كرارا أو بلوط طبيعي", 
    sandalyeAdedi: "عدد الكراسي", 
    sandalyeDetay: "خيارات لـ 6 أو 8 أشخاص", 
    uzmanDestegi: "دعم الخبراء", 
    uzmanDetay: "مهندسونا جاهزون للمساعدة.",
    indirimBaslik: "خصم خاص -20% حصرياً لباقة الزفاف",
    waMesaj: "مرحباً، هذه تفضيلاتي للباقة:"
  }
};

export default function PackageDetailPage() {
  const { lang } = useLanguage();
  const t = translations[lang as keyof typeof translations];
  const params = useParams();
  const slug = (params.slug as string) || "premium";

  const currentPackage = packageData[slug as keyof typeof packageData] || packageData["premium"];

  const [selectedWood, setSelectedWood] = useState(0);
  const [selectedFabric, setSelectedFabric] = useState(1);
  const [selectedSofaColor, setSelectedSofaColor] = useState(5);

  const [bedSlide, setBedSlide] = useState(0);
  const [sofaSlide, setSofaSlide] = useState(0);
  const [diningSlide, setDiningSlide] = useState(0);

  const woodColors = ["#4a3728", "#8c7f73", "#d2b48c"];
  const woodNames = ["Koyu Ceviz", "Açık Meşe", "Doğal Ahşap"];
  const sofaColors = ["#eacbd2", "#dcdde1", "#8ba1b5", "#2d4a5a", "#fdf3d0", "#849021", "#556b2f", "#1f3b2a"];
  const sofaColorNames = ["Gül Kurusu", "Açık Gri", "Buz Mavisi", "Lacivert", "Krem", "Hardal", "Ada Çayı", "Zümrüt Yeşil"];

  const bedImages = woodColors.map((_, idx) => {
    const base = currentPackage.images.bed;
    return [base[idx % 3], base[(idx+1) % 3], base[(idx+2) % 3]];
  });

  const sofaImages = sofaColors.map((_, idx) => {
    const base = currentPackage.images.sofa;
    return [base[idx % 3], base[(idx+1) % 3], base[(idx+2) % 3]];
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, setSlideIndex: (idx: number) => void) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const index = Math.round(scrollLeft / width);
    setSlideIndex(index);
  };

  const sendConfigToWhatsApp = () => {
    const phoneNumber = "905514835322";
    let text = `${t.waMesaj}\n\n📦 *Paket:* ${currentPackage.name[lang as keyof typeof currentPackage.name]}\n🛏️ *Yatak Odası:* ${woodNames[selectedWood]} / ${t.kumaslar[selectedFabric]}\n🛋️ *Oturma Grubu:* ${sofaColorNames[selectedSofaColor]}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] pt-32 pb-16">
      
      {/* BREADCRUMB */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 mb-8">
        <div className="flex items-center gap-2 text-[12px] font-medium text-[#8c7f73] mb-2">
          <Link href="/" className="hover:text-[#2a241e] transition-colors">{t.anaSayfa}</Link>
          <ChevronRight size={14} className="rtl:rotate-180" />
          <span className="text-[#2a241e] font-bold">{currentPackage.name[lang as keyof typeof currentPackage.name]}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-serif text-[#2a241e]">{currentPackage.name[lang as keyof typeof currentPackage.name]}</h1>
      </div>

      {/* BÖLÜM 01: YATAK ODASI */}
      <section className="py-6 max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="w-full lg:col-span-7">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2" style={{ scrollbarWidth: 'none' }} onScroll={(e) => handleScroll(e, setBedSlide)}>
              {bedImages[selectedWood].map((img, idx) => (
                <div key={idx} className="flex-none w-full h-[320px] md:h-[450px] snap-center rounded-[20px] overflow-hidden bg-[#e8e4dc]">
                  <img src={img} className="w-full h-full object-cover" alt="Bed option"/>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-2">
              {bedImages[selectedWood].map((_, idx) => <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === bedSlide ? 'bg-[#2a241e]' : 'bg-[#d4d4d8]'}`}></div>)}
            </div>
          </div>

          <div className="flex flex-col bg-[#f0ece6] p-5 md:p-7 rounded-[20px] lg:col-span-5">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#8c7f73] uppercase mb-1">{t.bolum1Tag}</span>
            <h2 className="text-2xl md:text-3xl font-serif text-[#2a241e] mb-1.5">{t.bolum1Baslik}</h2>
            <p className="text-[#52525b] text-[13px] leading-relaxed mb-4">{t.bolum1Aciklama}</p>
          </div>
        </div>
      </section>

      {/* BÖLÜM 02: OTURMA GRUBU */}
      <section className="py-10 max-w-[1200px] mx-auto px-6 md:px-10 border-t border-[#e8e4dc]">
        <div className="mb-5">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#8c7f73] uppercase mb-1 block">{t.bolum2Tag}</span>
          <h2 className="text-2xl md:text-3xl font-serif text-[#2a241e] mb-1">{t.bolum2Baslik}</h2>
          <p className="text-[#52525b] text-[13px] max-w-lg">{t.bolum2Aciklama}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="w-full lg:col-span-7">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2" style={{ scrollbarWidth: 'none' }} onScroll={(e) => handleScroll(e, setSofaSlide)}>
              {sofaImages[selectedSofaColor].map((img, idx) => (
                <div key={idx} className="flex-none w-full h-[320px] md:h-[450px] snap-center rounded-[20px] overflow-hidden bg-[#e8e4dc]">
                  <img src={img} className="w-full h-full object-cover" alt="Sofa option"/>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-2">
              {sofaImages[selectedSofaColor].map((_, idx) => <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === sofaSlide ? 'bg-[#2a241e]' : 'bg-[#d4d4d8]'}`}></div>)}
            </div>
          </div>

          <div className="flex flex-col bg-[#f0ece6] p-5 md:p-6 rounded-[20px] lg:col-span-5 h-auto self-start">
            <div className="mb-6">
              <span className="text-[9px] font-bold tracking-widest text-[#2a241e] uppercase mb-1 block">{t.teknikDetay}</span>
              <div className="flex flex-col gap-0.5">
                {t.olculer.map((olcu, idx) => <span key={idx} className="text-[12px] md:text-[13px] text-[#52525b]">{olcu}</span>)}
              </div>
            </div>

            <button onClick={sendConfigToWhatsApp} className="w-full bg-transparent border border-[#2a241e] text-[#2a241e] py-3 md:py-3.5 rounded-full font-bold text-[11px] tracking-widest uppercase hover:bg-[#2a241e] hover:text-white transition-all shadow-sm">
              <Download size={14} className="inline mr-2" /> {t.cizimIndir}
            </button>
          </div>
        </div>
      </section>

      {/* BÖLÜM 03: YEMEK ODASI */}
      <section className="py-10 max-w-[1200px] mx-auto px-6 md:px-10 border-t border-[#e8e4dc]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="flex flex-col lg:col-span-5">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#8c7f73] uppercase mb-1">{t.bolum3Tag}</span>
            <h2 className="text-2xl md:text-3xl font-serif text-[#2a241e] mb-2">{t.bolum3Baslik}</h2>
            <p className="text-[#52525b] text-[13px] mb-6">{t.bolum3Aciklama}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#f0ece6] p-4 rounded-[15px]"><Layers className="text-[#8c7f73] mb-2" size={16}/><h4 className="text-[10px] font-bold text-[#2a241e] uppercase">{t.tablaSecimi}</h4><p className="text-[11px] text-[#52525b]">{t.tablaDetay}</p></div>
              <div className="bg-[#f0ece6] p-4 rounded-[15px]"><Users className="text-[#8c7f73] mb-2" size={16}/><h4 className="text-[10px] font-bold text-[#2a241e] uppercase">{t.sandalyeAdedi}</h4><p className="text-[11px] text-[#52525b]">{t.sandalyeDetay}</p></div>
            </div>
          </div>
          <div className="relative lg:col-span-7">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4" style={{ scrollbarWidth: 'none' }} onScroll={(e) => handleScroll(e, setDiningSlide)}>
              {currentPackage.images.dining.map((img, idx) => (
                <div key={idx} className="flex-none w-full h-[320px] md:h-[450px] snap-center rounded-[20px] overflow-hidden bg-[#e8e4dc]"><img src={img} className="w-full h-full object-cover" alt="Dining room option"/></div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-2">
              {currentPackage.images.dining.map((_, idx) => <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === diningSlide ? 'bg-[#2a241e]' : 'bg-[#d4d4d8]'}`}></div>)}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}