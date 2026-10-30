"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Archive, ClipboardList, LayoutDashboard, Ruler, Sofa } from "lucide-react";
import { adminJson } from "./client";

const links = [
  { href: "/admin", label: "Özet", icon: LayoutDashboard },
  { href: "/admin/aktif", label: "Aktif", icon: ClipboardList },
  { href: "/admin/olcu", label: "Ölçü", icon: Ruler },
  { href: "/admin/arsiv", label: "Arşiv", icon: Archive },
  { href: "/admin/urunler", label: "Ürünler", icon: Sofa },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await adminJson("/api/auth/logout", { method: "POST" });
    router.replace("/admin/giris");
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#2a241e]">
      <header className="sticky top-0 z-20 border-b border-[#efeae3] bg-[#faf9f6]/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="font-serif text-xl">Mobilyam Yönetim</p>
          <button type="button" onClick={logout} className="text-sm font-medium text-[#8c7f73]">Çıkış</button>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl">
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-[#efeae3] bg-[#f7f4ef] p-5 md:flex">
          <p className="font-serif text-2xl leading-tight">Mobilyam<br />Yönetim</p>
          <nav className="mt-8 flex flex-col gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={`rounded-xl px-3 py-2.5 text-sm font-medium ${active ? "bg-[#2a241e] text-white" : "hover:bg-white"}`}>
                  {link.label === "Aktif" ? "Aktif Siparişler" : link.label === "Ölçü" ? "Ölçü Alınacaklar" : link.label === "Arşiv" ? "Tamamlananlar" : link.label}
                </Link>
              );
            })}
          </nav>
          <button type="button" onClick={logout} className="mt-auto text-left text-sm font-medium text-[#8c7f73]">Çıkış yap</button>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-5 pb-[calc(76px+env(safe-area-inset-bottom)+20px)] md:px-8 md:py-8 md:pb-10">{children}</main>
      </div>
      <nav aria-label="Bölümler" className="fixed inset-x-0 bottom-0 z-20 border-t border-[#efeae3] bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="grid h-[76px] grid-cols-5">
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1.5 px-0.5 ${active ? "text-[#2a241e]" : "text-[#8c7f73]"}`}
              >
                <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
                <span className="text-[13px] font-semibold leading-none">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
