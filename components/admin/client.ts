export async function adminJson<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(url, { ...init, headers });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    window.location.href = "/admin/giris";
    throw new Error("Giriş gerekli");
  }
  if (!response.ok) throw new Error(data.error || "İşlem tamamlanamadı");
  return data as T;
}

export const fieldClass = "w-full rounded-xl border border-[#e6e0d8] bg-white px-3 py-3 text-[15px] text-[#2a241e] outline-none focus:border-[#8c7f73]";
export const primaryClass = "rounded-xl bg-[#2a241e] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3d3328]";
export const ghostClass = "rounded-xl border border-[#e6e0d8] px-3 py-2 text-sm font-medium text-[#2a241e] hover:bg-[#f4f1eb]";
export const dangerClass = "rounded-xl border border-[#e7c8c4] px-3 py-2 text-sm font-medium text-[#9b3b32] hover:bg-[#fdf4f3]";
