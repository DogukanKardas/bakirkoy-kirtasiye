import type { Metadata } from "next";
import { getServices, getSettings } from "@db/queries";
import { ServicesGrid } from "./services-grid";

export const metadata: Metadata = {
  title: "Hizmetler",
  description:
    "Fotokopi, renkli baskı, spiralli ciltleme, laminasyon, vesikalık ve tarama — dükkândan dakikalar içinde.",
  alternates: { canonical: "/hizmetler" },
};

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([
    getServices(),
    getSettings(),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
        Dükkân servisleri
      </p>
      <h1 className="display-2 mt-3 max-w-[14ch] text-[var(--ink)]">
        Kâğıdın her hâli
      </h1>
      <p className="mt-4 max-w-xl text-[var(--ink-soft)]">
        Kırtasiyenin ötesi: fotokopiden ciltlemeye, günlük işlerinizi dükkândan
        çıkmadan halledin. Dosyanızı WhatsApp&rsquo;tan gönderin, geldiğinizde
        hazır olsun.
      </p>

      {services.length > 0 ? (
        <ServicesGrid services={services} />
      ) : (
        <p className="mt-12 text-[var(--ink-muted)]">
          Hizmet listesi yakında eklenecek — sorularınız için dükkânı arayın.
        </p>
      )}

      {settings.whatsapp ? (
        <div className="mt-12 flex flex-wrap items-center gap-4 border border-[var(--line)] bg-[var(--paper-deep)]/40 p-6">
          <p className="flex-1 text-sm text-[var(--ink-soft)]">
            Baskı işiniz mi var? Dosyayı gönderin, fiyatını söyleyelim.
          </p>
          <a
            href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent("Merhaba, baskı/fotokopi işim var. Dosya gönderebilir miyim?")}`}
            target="_blank"
            rel="noreferrer"
            className="bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)]"
          >
            Dosyayı WhatsApp&rsquo;tan gönder
          </a>
        </div>
      ) : null}
    </div>
  );
}
