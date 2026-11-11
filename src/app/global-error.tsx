"use client";

import { useEffect } from "react";

/** Kök hata sınırı — layout bile çökerse devreye girer (sade, bağımsız stiller). */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          background: "#f3efe6",
          color: "#151515",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", margin: 0 }}>
          Sayfa açılamadı
        </h1>
        <p style={{ maxWidth: "28rem", color: "#4a463c" }}>
          Beklenmedik bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            background: "#151515",
            color: "#f3efe6",
            border: 0,
            padding: "0.9rem 1.6rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Yeniden dene
        </button>
      </body>
    </html>
  );
}
