import type { Metadata } from "next";
import Shell from "@/components/admin/Shell";

export const metadata: Metadata = {
  title: "Mobilyam Yönetim",
  description: "Sipariş, ölçü ve ürün yönetimi",
};

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
