"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminJson } from "./client";

const links = [
  { href: "/admin", label: "Özet" },
  { href: "/admin/aktif", label: "Aktif" },
  { href: "/admin/olcu", label: "Ölçü" },
  { href: "/admin/arsiv", label: "Arşiv" },
  { href: "/admin/urunler", label: "Ürünler" },
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
        <a href="/api/admin/export" className="mt-3 flex w-full items-center justify-center rounded-xl bg-[#2a241e] px-4 py-2.5 text-sm font-semibold text-white">
          Excel indir
        </a>
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
          <a href="/api/admin/export" className="mt-auto mb-4 rounded-xl bg-[#2a241e] px-3 py-2.5 text-center text-sm font-semibold text-white">
            Excel indir
          </a>
          <button type="button" onClick={logout} className="text-left text-sm font-medium text-[#8c7f73]">Çıkış yap</button>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-10">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-[#efeae3] bg-white px-1 py-2 md:hidden">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`text-center text-[11px] font-semibold ${active ? "text-[#2a241e]" : "text-[#8c7f73]"}`}>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
