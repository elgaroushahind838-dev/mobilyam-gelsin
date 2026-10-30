export type ParsedWhatsApp = {
  name: string;
  phone: string;
  notes: string;
};

const PHONE_RE = /(?:\+?\s*90|0)?\s*5\d{2}[\s().-]*\d{3}[\s.-]*\d{2}[\s.-]*\d{2}/;

export function parseWhatsAppSnippet(raw: string): ParsedWhatsApp {
  const text = raw.replace(/\u200e|\u200f/g, "").trim();
  const phoneMatch = text.match(PHONE_RE);
  const phone = phoneMatch?.[0]?.replace(/[^\d+]/g, "") ?? "";

  const labeled = text.match(/(?:^|\n)\s*(?:ad[ıi]|isim|müşteri|musteri|name)\s*[:\-]\s*(.+)/i);
  let name = labeled?.[1]?.trim().split("\n")[0]?.trim() ?? "";

  if (!name) {
    const ben = text.match(/\bben\s+([A-Za-zÇĞİÖŞÜçğıöşü][\p{L}'’.-]+(?:\s+[A-Za-zÇĞİÖŞÜçğıöşü][\p{L}'’.-]+){0,2})/u);
    name = ben?.[1]?.trim() ?? "";
  }

  if (!name) {
    const line = text
      .split("\n")
      .map((item) => item.trim())
      .find((item) => item && !PHONE_RE.test(item) && !/https?:|whatsapp/i.test(item) && item.length < 48);
    if (line && /^[\p{L}][\p{L}'’.\-\s]{1,40}$/u.test(line)) name = line;
  }

  return { name, phone, notes: text };
}
