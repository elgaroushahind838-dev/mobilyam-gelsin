import Image from "next/image";

function canOptimize(src: string) {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const host = new URL(src).hostname;
    return host === "images.unsplash.com" || host.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export default function AdminImage({ src, sizes, className }: { src?: string; sizes: string; className: string }) {
  if (!src) return <div className={`bg-[#efeae3] ${className}`} />;
  if (!canOptimize(src)) return <img src={src} alt="" className={`object-cover ${className}`} />;
  return (
    <div className={`relative overflow-hidden bg-[#efeae3] ${className}`}>
      <Image src={src} alt="" fill sizes={sizes} quality={60} className="object-cover" />
    </div>
  );
}
