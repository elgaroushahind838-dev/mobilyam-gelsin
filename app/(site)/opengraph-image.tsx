import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Mobilyam Gelsin — İstanbul’da gömme dolap ve özel tasarım mobilya";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf9f6",
          color: "#2a241e",
          padding: "72px",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, color: "#8c7f73" }}>İSTANBUL</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 76, lineHeight: 1.05 }}>Mobilyam Gelsin</div>
          <div style={{ fontSize: 34, color: "#4d453e" }}>Gömme dolap · Gardırop · Özel tasarım mobilya</div>
        </div>
        <div style={{ fontSize: 24, color: "#8c7f73" }}>Esenyurt atölyesi · +90 551 483 53 22</div>
      </div>
    ),
    size,
  );
}
