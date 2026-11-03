"use client";

import { useEffect, useState } from "react";
import { adminJson, ghostClass, primaryClass } from "./client";

type Status = {
  appId: string;
  configId: string;
  connected: boolean;
  displayPhone: string;
  wabaId: string;
  phoneNumberId: string;
};

type FacebookAuth = { code?: string };
type FacebookSdk = {
  init: (options: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
  login: (callback: (response: { authResponse?: FacebookAuth }) => void, options: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

function loadSdk(appId: string) {
  return new Promise<FacebookSdk>((resolve, reject) => {
    const ready = () => {
      window.FB?.init({ appId, cookie: false, xfbml: false, version: "v21.0" });
      if (window.FB) resolve(window.FB);
      else reject(new Error("Facebook SDK yüklenemedi"));
    };
    if (window.FB) {
      ready();
      return;
    }
    window.fbAsyncInit = ready;
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onerror = () => reject(new Error("Facebook SDK yüklenemedi"));
    document.body.appendChild(script);
  });
}

export default function WhatsAppScreen() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function refresh() {
    return adminJson<Status>("/api/admin/whatsapp").then(setStatus);
  }

  useEffect(() => {
    refresh().catch((err: Error) => setError(err.message));
  }, []);

  async function connect() {
    if (!status?.appId || !status.configId) {
      setError("META_APP_ID ve META_ES_CONFIG_ID tanımlı değil.");
      return;
    }
    setPending(true);
    setError("");
    let session: { wabaId?: string; phoneNumberId?: string } = {};
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data.type === "WA_EMBEDDED_SIGNUP" && data.data?.waba_id && data.data?.phone_number_id) {
          session = { wabaId: String(data.data.waba_id), phoneNumberId: String(data.data.phone_number_id) };
        }
      } catch {
        // Facebook also posts non-JSON messages.
      }
    };
    window.addEventListener("message", onMessage);
    try {
      const sdk = await loadSdk(status.appId);
      const code = await new Promise<string>((resolve, reject) => {
        sdk.login((response) => {
          const value = response.authResponse?.code;
          if (value) resolve(value);
          else reject(new Error("WhatsApp bağlantısı tamamlanmadı"));
        }, {
          config_id: status.configId,
          response_type: "code",
          override_default_response_type: true,
          extras: { setup: {}, featureType: "whatsapp_business_app_onboarding", sessionInfoVersion: "3" },
        });
      });
      if (!session.wabaId || !session.phoneNumberId) throw new Error("WhatsApp hesabı seçilmedi");
      await adminJson("/api/admin/whatsapp/connect", {
        method: "POST",
        body: JSON.stringify({ code, wabaId: session.wabaId, phoneNumberId: session.phoneNumberId }),
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bağlantı kurulamadı");
    } finally {
      window.removeEventListener("message", onMessage);
      setPending(false);
    }
  }

  async function disconnect() {
    setPending(true);
    setError("");
    try {
      await adminJson("/api/admin/whatsapp", { method: "DELETE" });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bağlantı kesilemedi");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl">WhatsApp</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6b625a]">
        Telefondaki WhatsApp Business uygulaması aynı numarayla çalışmaya devam eder. Gelen ve giden mesajlardan ölçü kaydı açılır. Elinizle eklediğiniz kayıtlar olduğu gibi kalır.
      </p>
      {error && <p className="mt-4 rounded-2xl bg-[#fdf4f3] px-4 py-3 text-sm text-[#9b3b32]">{error}</p>}
      {status?.connected ? (
        <div className="mt-6 rounded-3xl border border-[#efeae3] bg-white p-5">
          <p className="text-sm font-semibold text-[#128C7E]">Bağlı</p>
          <p className="mt-2 text-lg font-semibold">{status.displayPhone || status.phoneNumberId}</p>
          <button type="button" className={`${ghostClass} mt-4`} disabled={pending} onClick={disconnect}>Bağlantıyı kes</button>
        </div>
      ) : (
        <button type="button" className={`${primaryClass} mt-6`} disabled={pending || !status} onClick={connect}>
          {pending ? "Bağlanıyor" : "WhatsApp'ı bağla"}
        </button>
      )}
    </div>
  );
}
