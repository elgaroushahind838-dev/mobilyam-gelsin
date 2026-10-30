"use client";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, MessageCircle, MapPin, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const translations = {
  TR: {
    etiket: "YENİ SEZON",
    baslik1: "Mekânınıza Özel",
    baslik2: "Tasarım",
    aciklama: "Özel tasarım mobilya ve sabit dolapları yaşam alanınıza göre tasarlıyor ve üretiyoruz.",
    buton1: "Koleksiyonu Keşfet",
    buton2: "Atölyemiz",
    kolBaslik: "Koleksiyonlar",
    cOturma: "Oturma Odası",
    cYemek: "Yemek Odası",
    cYatak: "Yatak Odası",
    cGenc: "Genç Odası",
    cOfis: "Çalışma Odası",
    cPortmanto: "Portmanto",
    
    secKoleksiyonlar: "Düğün Paketleri",
    stokta: "StoktaMevcut",
    detaylar: "Detayları İncele",
    whatsapp: "WhatsApp ile Sipariş",
    
    paketler: [
      {
        isim1: "Ekonomik",
        isim2: "Paket"
      },
      {
        isim1: "Premium",
        isim2: "Paket"
      },
      {
        isim1: "Standart",
        isim2: "Paket"
      }
    ],

    hikayemizEtiket: "HİKAYEMİZ",
    hikayemizBaslik: "İstanbul'un Kalbinde Modern Bir Atölye",
    hikayemizParagraf1: "Mobilyam Gelsin, mobilya tasarımını sadece bir eşya değil, bir yaşam biçimi olarak ele alır. İstanbul'un zengin tasarım mirasından beslenerek, küresel bir minimalizm anlayışını benimsiyoruz.",
    hikayemizParagraf2: "Her parçamız, sürdürülebilir ormanlardan elde edilen ahşaplar ve usta zanaatkarlarımızın titiz çalışmasıyla üretilir. Amacımız, nesiller boyu aktarılabilecek sessiz ve güçlü tasarımlar yaratmaktır.",
    hikayemizStat1Sayi: "25+",
    hikayemizStat1Yazi: "Yıllık Tecrübe",

    iletisimBaslik: "Atölyemiz",
    atolyeEtiket: "ATÖLYE",
    atolyeAdres1: "385. Sokak, Yunus Emre Mahallesi",
    atolyeAdres2: "34510 Esenyurt, İstanbul",
    haritadaAc: "Google Haritalar'da aç",
    bizeUlasin: "BİZE ULAŞIN",
    iletisimKartBaslik: "Hayalinizdeki Yaşam Alanını Birlikte Tasarlayalım",
    iletisimKartMetin: "Koleksiyonlarımız hakkında detaylı bilgi almak veya özel projeleriniz için tasarım ekibimizle görüşmek için bizimle iletişime geçin.",
    whatsappHemen: "WhatsApp ile Hemen Bilgi Alın",
    elIsciligi: "%100 El İşçiliği"
  },
  EN: {
    etiket: "NEW SEASON",
    baslik1: "Designed for",
    baslik2: "Your Space",
    aciklama: "We design and build custom furniture and fitted wardrobes for your space.",
    buton1: "Discover Collection",
    buton2: "Our Workshop",
    kolBaslik: "Collections",
    cOturma: "Living Room",
    cYemek: "Dining Room",
    cYatak: "Bedroom",
    cGenc: "Youth Room",
    cOfis: "Office",
    cPortmanto: "Entryway",
    
    secKoleksiyonlar: "wedding packages",
    stokta: "InStock",
    detaylar: "View Details",
    whatsapp: "Order via WhatsApp",
    
    paketler: [
      {
        isim1: "Economic",
        isim2: "Package"
      },
      {
        isim1: "Premium",
        isim2: "Package"
      },
      {
        isim1: "Standard",
        isim2: "Package"
      }
    ],

    hikayemizEtiket: "OUR STORY",
    hikayemizBaslik: "A Modern Workshop in the Heart of Istanbul",
    hikayemizParagraf1: "Mobilyam Gelsin considers furniture design not just an object, but a way of life. Nourished by Istanbul's rich design heritage, we embrace a global sense of minimalism.",
    hikayemizParagraf2: "Every piece is crafted with wood from sustainable forests and the meticulous work of our master artisans. Our goal is to create quiet, powerful designs that can be passed down for generations.",
    hikayemizStat1Sayi: "25+",
    hikayemizStat1Yazi: "Years of Experience",
    hikayemizStat2Yazi: "Completed Projects",

    iletisimBaslik: "Our Workshop",
    atolyeEtiket: "WORKSHOP",
    atolyeAdres1: "385. Sokak, Yunus Emre Mahallesi",
    atolyeAdres2: "34510 Esenyurt, Istanbul",
    haritadaAc: "Open in Google Maps",
    bizeUlasin: "CONTACT US",
    iletisimKartBaslik: "Let's Design Your Dream Living Space Together",
    iletisimKartMetin: "Contact us to get detailed information about our collections or to meet with our design team for your custom projects.",
    whatsappHemen: "Get Info via WhatsApp Now",
    elIsciligi: "100% Handcrafted"
  },
  AR: {
    etiket: "الموسم الجديد",
    baslik1: "تصميم خاص",
    baslik2: "لمساحتك",
    aciklama: "نصمّم ونصنع الأثاث حسب الطلب والخزائن الثابتة لمساحتك.",
    buton1: "اكتشف المجموعة",
    buton2: "ورشتنا",
    kolBaslik: "المجموعات",
    cOturma: "غرفة الجلوس",
    cYemek: "غرفة الطعام",
    cYatak: "غرفة النوم",
    cGenc: "غرفة الشباب",
    cOfis: "المكتب",
    cPortmanto: "بورت مانتو",
    
    secKoleksiyonlar: "حزم الزفاف",
    stokta: "متوفر_بالمخزون",
    detaylar: "عرض التفاصيل",
    whatsapp: "اطلب عبر واتساب",
    
    paketler: [
      {
        isim1: "الباقة",
        isim2: "الاقتصادية"
      },
      {
        isim1: "الباقة",
        isim2: "المميزة"
      },
      {
        isim1: "الباقة",
        isim2: "القياسية"
      }
    ],

    hikayemizEtiket: "قصتنا",
    hikayemizBaslik: "ورشة حديثة في قلب إسطنبول",
    hikayemizParagraf1: "تعتبر Mibilyam Gelsin تصميم الأثاث ليس مجرد شيء، بل أسلوب حياة. نتغذى على تراث التصميم الغني لإسطنبول ونتبنى فهماً عالمياً للحد الأدنى من التفاصيل (المينيماليزم).",
    hikayemizParagraf2: "يتم تصنيع كل قطعة من أخشاب الغابات المستدامة والعمل الدقيق للحرفيين المهرة. هدفنا هو إنشاء تصميمات هادئة وقوية يمكن توارثها عبر الأجيال.",
    hikayemizStat1Sayi: "+25",
    hikayemizStat1Yazi: "سنوات من الخبرة",
    hikayemizStat2Sayi: "+1200",
    hikayemizStat2Yazi: "مشروع مكتمل",

    iletisimBaslik: "ورشتنا",
    atolyeEtiket: "الورشة",
    atolyeAdres1: "385. Sokak، حي يونس إمره",
    atolyeAdres2: "34510 إسنيورت، إسطنبول",
    haritadaAc: "افتح في خرائط Google",
    bizeUlasin: "اتصل بنا",
    iletisimKartBaslik: "دعنا نصمم مساحة المعيشة التي تحلم بها معًا",
    iletisimKartMetin: "اتصل بنا للحصول على معلومات مفصلة حول مجموعاتنا أو لمقابلة فريق التصميم الخاص بنا لمشاريعك المخصصة.",
    whatsappHemen: "احصل على معلومات عبر واتساب الآن",
    elIsciligi: "مصنوع يدوياً 100%"
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
} as const;

const fadeUpItem = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
} as const;

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1, ease: "easeOut" } }
} as const;

export default function Home() {
  const { lang } = useLanguage();
  const t = translations[lang as keyof typeof translations];

  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;

    let frame = 0;
    let attempts = 0;
    const scrollToSection = () => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ block: "start" });
        return;
      }
      if (attempts < 8) {
        attempts += 1;
        frame = window.requestAnimationFrame(scrollToSection);
      }
    };

    scrollToSection();
    const timer = window.setTimeout(scrollToSection, 200);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);
  
  const sendWhatsApp = (productName?: string, imageUrl?: string) => {
    const phoneNumber = "905514835322"; 
    let message = t.whatsappHemen;

    if (productName) {
      let imgLink = "";
      if (imageUrl) {
        imgLink = imageUrl.startsWith('http') ? imageUrl : `${window.location.origin}${imageUrl}`;
      }
      
      if (lang === 'AR') {
        message = `مرحباً، أنا مهتم بهذا المنتج/الباقة:\n\n*${productName}*\n\nرابط صورة الموديل: ${imgLink}`;
      } else if (lang === 'EN') {
        message = `Hello, I am interested in this product/package:\n\n*${productName}*\n\nImage link: ${imgLink}`;
      } else {
        message = `Merhaba, şu ürünle/paketle ilgileniyorum:\n\n*${productName}*\n\nGörsel: ${imgLink}`;
      }
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; 
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const categories = [
    { id: 1, key: "cOturma", href: "/kategori/oturma-odasi", img: "/images/oturma-odasi.jpg" }, 
    { id: 2, key: "cYemek", href: "/kategori/yemek-odasi", img: "/images/yemek-odasi.jpg" },
    { id: 3, key: "cYatak", href: "/kategori/yatak-odasi", img: "/images/yatak-odasi.jpg" },
    { id: 4, key: "cGenc", href: "/kategori/genc-odasi", img: "/images/genc-odasi.jpg" },
    { id: 5, key: "cOfis", href: "/kategori/ofis", img: "/images/ofis.jpg" },
    { id: 6, key: "cPortmanto", href: "/kategori/portmanto", img: "/images/portmanto.jpg" },
  ];

  const packageImages = [
    "/images/oturma-odasi.jpg", 
    "/images/yatak-odasi.jpg", 
    "/images/yemek-odasi.jpg", 
  ];

  return (
    <main className="relative w-full">
      
      {/* 1. Hero Section */}
      <section className="relative flex h-screen w-full min-w-0 items-center overflow-hidden px-4 sm:px-6 md:px-16">
        <motion.div variants={fadeIn} initial="hidden" animate="show" className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000&auto=format&fit=crop" 
            alt="Lüks Mobilya" 
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-16 box-border w-full min-w-0 max-w-2xl rounded-2xl border border-white/5 bg-transparent p-5 shadow-2xl backdrop-blur-sm sm:p-10 md:p-14"
        >
          <span className="mb-4 block max-w-full text-xs font-semibold uppercase tracking-[0.18em] text-white/90 sm:tracking-[0.3em] md:text-sm">
            {t.etiket}
          </span>
          <h1 className="mb-6 max-w-full break-words font-serif text-[2.15rem] leading-tight text-white drop-shadow-lg min-[400px]:text-5xl md:text-7xl">
            {t.baslik1} <br /> {t.baslik2}
          </h1>
          <p className="mb-8 max-w-full break-words text-base font-light leading-relaxed text-white/90 drop-shadow-md sm:mb-10 sm:text-lg">
            {t.aciklama}
          </p>
          
          <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:gap-5">
            <Link href="#koleksiyonlar" 
              className="w-full min-w-0 rounded-xl bg-[#4d453e] px-6 py-4 text-center font-medium text-white transition-all duration-300 hover:bg-[#241a0e] hover:shadow-xl sm:w-auto sm:px-8">
              {t.buton1}
            </Link>
            <a href="#magazalar" 
              className="w-full min-w-0 rounded-xl border-2 border-white bg-transparent px-6 py-4 text-center font-medium text-white transition-all duration-300 hover:bg-white hover:text-[#241a0e] hover:shadow-xl sm:w-auto sm:px-8">
              {t.buton2}
            </a>
          </div>
        </motion.div>
      </section>

      {/* 2. Koleksiyonlar Slider */}
      <section id="koleksiyonlar" className="scroll-mt-28 pt-24 pb-12 bg-[#faf9f6] overflow-hidden">
        <motion.div 
          variants={staggerContainer} 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1500px] mx-auto px-6 md:px-16"
        >
          <motion.h2 variants={fadeUpItem} className="text-4xl md:text-5xl font-serif text-[#2a241e] mb-12">
            {t.kolBaslik}
          </motion.h2>
          <motion.div 
            variants={fadeUpItem}
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
           {categories.map((cat) => (
              <Link href={cat.href} key={cat.id} className="flex-none w-[320px] md:w-[360px] snap-start bg-white p-4 rounded-[32px] shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col">
                <div className="w-full h-[240px] rounded-[24px] overflow-hidden bg-[#f4f2f0]">
                  <img src={cat.img} alt={t[cat.key as keyof typeof t] as string} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"/>
                </div>
                <div className="py-5 text-center text-[#2a241e] font-medium text-[18px] tracking-wide group-hover:text-[#ba7e6a] transition-colors">
                  {t[cat.key as keyof typeof t] as string}
                </div>
              </Link>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* 3. Seçkin Koleksiyonlar (Paketler) */}
      <section className="py-20 bg-[#faf9f6]">
        <motion.div 
          variants={staggerContainer} 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1500px] mx-auto px-6 md:px-16"
        >
          <motion.h2 variants={fadeUpItem} className="text-[44px] md:text-[54px] font-serif text-center text-[#241a0e] mb-16">
            {t.secKoleksiyonlar}
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
            {t.paketler.map((paket, index) => (
              <motion.div variants={fadeUpItem} key={index} className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#f0ece6] flex flex-col hover:shadow-xl transition-shadow duration-500">
                <div className="h-[380px] w-full overflow-hidden bg-[#f4f2f0]">
                  <img src={packageImages[index]} alt={paket.isim1} className="w-full h-full object-cover"/>
                </div>
                <div className="p-10 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-10">
                    <h3 className="text-[36px] font-serif text-[#241a0e] leading-[1.15]">
                      {paket.isim1}<br/>{paket.isim2}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[#0fa153] pt-2">
                      <CheckCircle2 size={16} className="fill-[#0fa153] text-white" />
                      <span className="text-[12px] font-bold tracking-tight">{t.stokta}</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex flex-col gap-4">
                      <Link 
                        href={`/paket/${paket.isim1.toLowerCase()}`}
                        className="w-full bg-[#241a0e] text-[#f9f8f4] py-5 rounded-2xl font-semibold text-[17px] tracking-wide hover:bg-[#382b1c] transition-colors flex items-center justify-center"
                      >
                        {t.detaylar}
                      </Link>
                      <button 
                        onClick={() => sendWhatsApp(`${paket.isim1} ${paket.isim2}`, packageImages[index])}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#22c55e] px-4 py-4 text-center text-[15px] font-semibold leading-none tracking-wide text-white transition-colors hover:bg-[#1ca64e] sm:py-5 sm:text-[17px]"
                      >
                        <MessageCircle size={20} className="shrink-0 fill-white" aria-hidden="true" />
                        <span className="whitespace-nowrap">{t.whatsapp}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 4. Hakkımızda (Hikayemiz) Bölümü */}
      <section id="hakkimizda" className="scroll-mt-28 py-24 bg-[#faf9f6] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -50 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="flex flex-col max-w-xl"
            >
              <span className="text-xs font-bold tracking-[0.2em] text-[#8c7f73] uppercase mb-6 block">
                {t.hikayemizEtiket}
              </span>
              <h2 className="text-4xl md:text-[44px] leading-[1.2] font-serif text-[#2a241e] mb-8">
                {t.hikayemizBaslik}
              </h2>
              <div className="text-[16px] leading-relaxed text-[#52525b] mb-6 font-medium">
                <p className="mb-6">{t.hikayemizParagraf1}</p>
                <p>{t.hikayemizParagraf2}</p>
              </div>
              <div className="w-full h-[1px] bg-[#e5e5e5] my-10"></div>
              <div className="flex gap-16">
                <div>
                  <p className="text-3xl md:text-4xl font-serif text-[#2a241e] mb-2">{t.hikayemizStat1Sayi}</p>
                  <p className="text-[11px] font-bold text-[#8c7f73] uppercase tracking-wider">{t.hikayemizStat1Yazi}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] mt-10 lg:mt-0"
            >
              <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 w-[80%] h-[75%] rounded-[32px] overflow-hidden shadow-lg">
               <img src="/images/hikayemiz2.jpg" alt="Hikayemiz Görsel 2" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 left-0 rtl:left-auto rtl:right-0 w-[60%] h-[65%] rounded-[32px] overflow-hidden border-[12px] border-[#faf9f6] shadow-2xl z-10">
               <img src="/images/hikayemiz1.jpg" alt="Hikayemiz Görsel 1" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. İletişim / Showroom Konumları Bölümü */}
      <section id="magazalar" className="py-24 bg-[#faf9f6] overflow-hidden">
        <motion.div 
          variants={staggerContainer} 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1400px] mx-auto px-6 md:px-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            
            <motion.div variants={fadeUpItem} className="flex flex-col">
              <h2 className="text-[30px] md:text-[38px] font-serif text-[#2a241e] mb-12">
                {t.iletisimBaslik}
              </h2>
              <a
                href="https://maps.app.goo.gl/JXp1TMJT1MvVsya86"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-6 ltr:border-l-4 rtl:border-r-4 ltr:pl-6 rtl:pr-6 border-[#8c7f73] group w-fit max-w-xl"
              >
                <MapPin
                  className="text-[#2a241e] w-6 h-6 flex-shrink-0 mt-1"
                  strokeWidth={2.5}
                />
                <div className="flex flex-col gap-1">
                  <p className="text-[12px] font-bold tracking-[0.18em] text-[#8c7f73] uppercase">
                    {t.atolyeEtiket}
                  </p>
                  <p className="text-[20px] font-bold tracking-wide text-[#2a241e] group-hover:text-[#ba7e6a] transition-colors">
                    {t.atolyeAdres1}
                  </p>
                  <p className="text-[18px] text-[#52525b]">
                    {t.atolyeAdres2}
                  </p>
                  <p className="text-[14px] font-semibold text-[#ba7e6a] mt-2 underline-offset-4 group-hover:underline">
                    {t.haritadaAc}
                  </p>
                </div>
              </a>

              <div className="mt-10 overflow-hidden rounded-[24px] border border-[#e5e5e5] shadow-sm h-56 md:h-64 bg-[#e8e4dc]">
                <iframe
                  title="Mobilyam Gelsin atölye haritası"
                  src="https://maps.google.com/maps?q=41.0257583,28.69529&hl=tr&z=16&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>

            <motion.div variants={fadeUpItem} className="bg-white px-5 py-8 sm:p-10 md:p-14 lg:p-16 rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-[#f0ece6]">
              <span className="text-xs font-bold tracking-[0.15em] text-[#8c7f73] uppercase mb-5 block">
                {t.bizeUlasin}
              </span>
              
              <h3 className="text-4xl md:text-[42px] font-serif leading-[1.2] text-[#2a241e] mb-6">
                {t.iletisimKartBaslik}
              </h3>
              
              <p className="text-[16px] text-[#52525b] leading-relaxed mb-10">
                {t.iletisimKartMetin}
              </p>
              
              <button 
                onClick={() => sendWhatsApp()} 
                className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#22c55e] px-3 py-4 text-center text-[13px] font-bold leading-none text-white shadow-sm transition-colors hover:bg-[#1ca64e] hover:shadow-md min-[380px]:text-[14px] min-[414px]:px-4 min-[414px]:text-[15px] sm:px-6 sm:py-5 sm:text-[16px]"
              >
                <MessageCircle size={18} className="shrink-0 fill-white" aria-hidden="true" />
                <span className="whitespace-nowrap">{t.whatsappHemen}</span>
              </button>

              <div className="flex items-center justify-center text-[#52525b]">
                <div className="flex items-center gap-2">
                  <BadgeCheck size={18} className="text-[#8c7f73]" />
                  <span className="text-[14px] font-medium tracking-wide">{t.elIsciligi}</span>
                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </section>

    </main>
  );
}