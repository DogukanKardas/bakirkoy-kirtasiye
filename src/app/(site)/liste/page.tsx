import type { Metadata } from "next";
import { getSchoolLists, getSettings } from "@db/queries";
import { ListView } from "./list-view";
import { SchoolLists } from "./school-lists";
import { PhotoListForm } from "./photo-list-form";

export const metadata: Metadata = {
  title: "Listem & Okul Listeleri",
  description:
    "Alışveriş listenizi oluşturun, hazır sınıf listelerini tek tıkla ekleyin ya da listenin fotoğrafını gönderin; biz hazırlayalım.",
  alternates: { canonical: "/liste" },
};

export default async function ListPage() {
  const [settings, schoolLists] = await Promise.all([
    getSettings(),
    getSchoolLists(),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
        Alışveriş listesi
      </p>
      <h1 className="display-2 mt-3 text-[var(--ink)]">Listem</h1>
      <p className="mt-4 max-w-lg text-[var(--ink-soft)]">
        Beğendiğiniz ürünleri burada biriktirin; hazır olunca tek tıkla
        WhatsApp&rsquo;tan dükkâna gönderin, biz hazırlayalım.
      </p>
      <ListView whatsapp={settings.whatsapp} shopName={settings.shopName} />

      <SchoolLists lists={schoolLists} />
      <PhotoListForm />
    </div>
  );
}
