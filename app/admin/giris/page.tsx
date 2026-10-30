"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Giriş yapılamadı");
      return;
    }
    const next = params.get("next");
    router.replace(next && next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-[#efeae3] bg-white p-6 shadow-sm">
        <img src="/images/mobilyamlogo.png" alt="Mobilyam Gelsin" className="mx-auto h-16 w-auto object-contain" />
        <h1 className="mt-4 text-center font-serif text-3xl text-[#2a241e]">Yönetim</h1>
        <p className="mt-2 text-center text-sm text-[#6b625a]">Sahip hesabı ile giriş yapın.</p>
        <label className="mt-6 block text-sm font-medium text-[#2a241e]">
          Parola
          <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-[#e6e0d8] px-3 py-3 outline-none focus:border-[#8c7f73]" />
        </label>
        {error && <p className="mt-3 text-sm text-[#9b3b32]">{error}</p>}
        <button type="submit" disabled={pending} className="mt-5 w-full rounded-xl bg-[#2a241e] py-3 font-semibold text-white disabled:opacity-60">
          {pending ? "Giriş yapılıyor" : "Giriş yap"}
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
