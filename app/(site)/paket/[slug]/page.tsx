"use client";
import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import { Layers, Users, ChevronRight, Download } from 'lucide-react';
import type { L10n, WeddingPackage } from "@/lib/types";

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
    cizimIndir: "SEND SELECTIONS VIA WHATSAPP",
    bolum3Tag: "PART 03", 
    bolum3Baslik: "Dining Room", 
    bolum3Aciklama: "Perfect harmony of marble and solid oak.",
    tablaSecimi: "TABLETOP", 
    tablaDetay: "Carrara Marble or Natural Oak", 
    sandalyeAdedi: "CHAIRS", 
    sandalyeDetay: "6 or 8 Person Options", 
    uzmanDestegi: "EXPERT SUPPORT", 
    uzmanDetay: "Our interior designers can configure this.",
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
    bolum2Aciklama: "الراحة في أبسط صورها، بهيكل خشب مجفف في الفرن.",
    teknikDetay: "تفاصيل تقنية", 
    cizimIndir: "أرسل خياراتي عبر واتساب",
    bolum3Tag: "الجزء 03", 
    bolum3Baslik: "غرفة الطعام", 
    bolum3Aciklama: "التناغم المثالي بين الرخام والبلوط الصلب.",
    tablaSecimi: "سطح الطاولة", 
    tablaDetay: "رخام كرارا أو بلوط طبيعي", 
    sandalyeAdedi: "عدد الكراسي", 
    sandalyeDetay: "خيارات لـ 6 أو 8 أشخاص", 
    uzmanDestegi: "دعم الخبراء", 
    uzmanDetay: "يمكن لمصممينا الداخليين إعداد هذا التكوين.",
    indirimBaslik: "خصم خاص -20% حصرياً لباقة الزفاف",
    waMesaj: "مرحباً، هذه تفضيلاتي للباقة:"
  }
};

export default function PackageDetailPage() {
  const { lang } = useLanguage();
  const t = translations[lang as keyof typeof translations];
  const params = useParams();
  const slug = (params.slug as string) || "";
  const locale: keyof L10n = lang === "EN" ? "en" : lang === "AR" ? "ar" : "tr";
  const [currentPackage, setCurrentPackage] = useState<WeddingPackage | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetch(`/api/catalog/packages/${slug}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (ignore) return;
        if (!data?.package) setMissing(true);
        else setCurrentPackage(data.package);
      })
      .catch(() => {
        if (!ignore) setMissing(true);
      });
    return () => {
      ignore = true;
    };
  }, [slug]);

  const [selectedWood, setSelectedWood] = useState(0);
  const [selectedFabric, setSelectedFabric] = useState(1);
  const [selectedSofaColor, setSelectedSofaColor] = useState(5);

  const [bedSlide, setBedSlide] = useState(0);
  const [sofaSlide, setSofaSlide] = useState(0);
  const [diningSlide, setDiningSlide] = useState(0);

  if (!currentPackage) {
    return <main className="min-h-screen bg-[#faf9f6] px-6 pt-32"><h1 className="font-serif text-4xl">{missing ? "Paket bulunamadı" : "Yükleniyor"}</h1></main>;
  }

  const woodColors = currentPackage.woods.map((item) => item.color);
  const woodNames = currentPackage.woods.map((item) => item.name[locale]);
  const sofaColors = currentPackage.sofaColors.map((item) => item.color);
  const sofaColorNames = currentPackage.sofaColors.map((item) => item.name[locale]);
  const fabricNames = currentPackage.fabrics.map((item) => item[locale]);

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
    const text = `${t.waMesaj}\n\n📦 *${t.paketler}:* ${currentPackage.name[locale]}\n🛏️ *${currentPackage.bedroomTitle[locale]}:* ${woodNames[selectedWood] || ""} / ${fabricNames[selectedFabric] || ""}\n🛋️ *${currentPackage.livingTitle[locale]}:* ${sofaColorNames[selectedSofaColor] || ""}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] pt-32 pb-16">
      
      {/* BREADCRUMB */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 mb-8">
        <div className="flex items-center gap-2 text-[12px] font-medium text-[#8c7f73] mb-2">
          <Link href="/" className="hover:text-[#2a241e] transition-colors">{t.anaSayfa}</Link>
          <ChevronRight size={14} className="rtl:rotate-180" />
          <span className="text-[#2a241e] font-bold">{currentPackage.name[locale]}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-serif text-[#2a241e]">{currentPackage.name[locale]}</h1>
        {currentPackage.description[locale] && currentPackage.description[locale] !== currentPackage.bedroomDescription[locale] ? <p className="mt-3 max-w-2xl text-[#52525b]">{currentPackage.description[locale]}</p> : null}
      </div>

      {/* BÖLÜM 01: YATAK ODASI */}
      <section className="py-6 max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="w-full lg:col-span-7">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2" style={{ scrollbarWidth: 'none' }} onScroll={(e) => handleScroll(e, setBedSlide)}>
              {bedImages[selectedWood].map((img, idx) => (
                <div key={idx} className="relative flex-none w-full h-[320px] md:h-[450px] snap-center rounded-[20px] overflow-hidden bg-[#e8e4dc]">
                  <Image src={img} alt={`${currentPackage.name[locale]} — ${currentPackage.bedroomTitle[locale]}`} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-2">
              {bedImages[selectedWood].map((_, idx) => <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === bedSlide ? 'bg-[#2a241e]' : 'bg-[#d4d4d8]'}`}></div>)}
            </div>
          </div>

          <div className="flex flex-col bg-[#f0ece6] p-5 md:p-7 rounded-[20px] lg:col-span-5">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#8c7f73] uppercase mb-1">{t.bolum1Tag}</span>
            <h2 className="text-2xl md:text-3xl font-serif text-[#2a241e] mb-1.5">{currentPackage.bedroomTitle[locale]}</h2>
            <p className="text-[#52525b] text-[13px] leading-relaxed mb-4">{currentPackage.bedroomDescription[locale]}</p>
            {currentPackage.included.length > 0 && (
              <ul className="mb-4 space-y-1 text-sm text-[#2a241e]">
                {currentPackage.included.map((item) => <li key={item.tr}>{t.dahil}: {item[locale]}</li>)}
              </ul>
            )}
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c7f73]">{t.ahsapSecenek}</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {currentPackage.woods.map((item, index) => (
                <button key={item.color + item.name.tr} type="button" onClick={() => setSelectedWood(index)} className={`h-8 w-8 rounded-full border ${selectedWood === index ? "ring-2 ring-[#2a241e]" : ""}`} style={{ background: item.color }} aria-label={item.name[locale]} />
              ))}
            </div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c7f73]">{t.kumasDoku}</p>
            <div className="flex flex-wrap gap-2">
              {fabricNames.map((name, index) => (
                <button key={name} type="button" onClick={() => setSelectedFabric(index)} className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedFabric === index ? "bg-[#2a241e] text-white" : "bg-white text-[#2a241e]"}`}>{name}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BÖLÜM 02: OTURMA GRUBU */}
      <section className="py-10 max-w-[1200px] mx-auto px-6 md:px-10 border-t border-[#e8e4dc]">
        <div className="mb-5">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#8c7f73] uppercase mb-1 block">{t.bolum2Tag}</span>
          <h2 className="text-2xl md:text-3xl font-serif text-[#2a241e] mb-1">{currentPackage.livingTitle[locale]}</h2>
          <p className="text-[#52525b] text-[13px] max-w-lg">{currentPackage.livingDescription[locale]}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {currentPackage.sofaColors.map((item, index) => (
              <button key={item.color + item.name.tr} type="button" onClick={() => setSelectedSofaColor(index)} className={`h-8 w-8 rounded-full border ${selectedSofaColor === index ? "ring-2 ring-[#2a241e]" : ""}`} style={{ background: item.color }} aria-label={item.name[locale]} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="w-full lg:col-span-7">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2" style={{ scrollbarWidth: 'none' }} onScroll={(e) => handleScroll(e, setSofaSlide)}>
              {sofaImages[selectedSofaColor].map((img, idx) => (
                <div key={idx} className="relative flex-none w-full h-[320px] md:h-[450px] snap-center rounded-[20px] overflow-hidden bg-[#e8e4dc]">
                  <Image src={img} alt={`${currentPackage.name[locale]} — ${currentPackage.livingTitle[locale]}`} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-2">
              {sofaImages[selectedSofaColor].map((_, idx) => <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === sofaSlide ? 'bg-[#2a241e]' : 'bg-[#d4d4d8]'}`}></div>)}
            </div>
          </div>

          <div className="flex flex-col bg-[#f0ece6] p-5 md:p-6 rounded-[20px] lg:col-span-5 h-auto self-start">
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
            <h2 className="text-2xl md:text-3xl font-serif text-[#2a241e] mb-2">{currentPackage.diningTitle[locale]}</h2>
            <p className="text-[#52525b] text-[13px] mb-6">{currentPackage.diningDescription[locale]}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#f0ece6] p-4 rounded-[15px]"><Layers className="text-[#8c7f73] mb-2" size={16}/><h4 className="text-[10px] font-bold text-[#2a241e] uppercase">{t.tablaSecimi}</h4><p className="text-[11px] text-[#52525b]">{currentPackage.tabletop[locale]}</p></div>
              <div className="bg-[#f0ece6] p-4 rounded-[15px]"><Users className="text-[#8c7f73] mb-2" size={16}/><h4 className="text-[10px] font-bold text-[#2a241e] uppercase">{t.sandalyeAdedi}</h4><p className="text-[11px] text-[#52525b]">{currentPackage.chairs[locale]}</p></div>
              <div className="col-span-2 bg-[#f0ece6] p-4 rounded-[15px]"><h4 className="text-[10px] font-bold text-[#2a241e] uppercase">{t.uzmanDestegi}</h4><p className="text-[11px] text-[#52525b]">{currentPackage.expert[locale]}</p></div>
            </div>
          </div>
          <div className="relative lg:col-span-7">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4" style={{ scrollbarWidth: 'none' }} onScroll={(e) => handleScroll(e, setDiningSlide)}>
              {currentPackage.images.dining.map((img, idx) => (
                <div key={idx} className="relative flex-none w-full h-[320px] md:h-[450px] snap-center rounded-[20px] overflow-hidden bg-[#e8e4dc]"><Image src={img} alt={`${currentPackage.name[locale]} — ${currentPackage.diningTitle[locale]}`} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" /></div>
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