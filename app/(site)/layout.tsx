import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { headers } from "next/headers";
import CatalogTracker from "@/components/CatalogTracker";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { jsonLdScript, metadataFor, structuredData } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  return metadataFor(h.get("x-pathname") || "/", h.get("x-site-lang"), h.get("x-subtype") || "");
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const blocks = await structuredData(h.get("x-pathname") || "/", h.get("x-site-lang"));
  return (
    <>
      {blocks.map((block) => (
        <script key={String(block["@type"])} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(block) }} />
      ))}
      <Navbar />
      {children}
      <Footer />
      <CatalogTracker />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
