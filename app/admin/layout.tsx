import type { Metadata, Viewport } from "next";
import PwaRegister from "@/components/admin/PwaRegister";

export const metadata: Metadata = {
  applicationName: "Mobilyam Yönetim",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Mobilyam Yönetim",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#2a241e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PwaRegister />
      {children}
    </>
  );
}
