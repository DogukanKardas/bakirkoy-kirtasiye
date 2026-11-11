import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@db/queries";
import { Story } from "./story";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Bakırköy'de kırk yıldır aynı köşede: kalemi denemeden, defterin kâğıdına dokunmadan alışveriş olmaz diyenlerin dükkânı.",
  alternates: { canonical: "/hakkimizda" },
};

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
        Dükkânın hikâyesi
      </p>
      <h1 className="display-2 mt-3 max-w-[16ch] text-[var(--ink)]">
        Kırk yıldır aynı köşedeyiz
      </h1>

      <Story settings={settings} />

      <div className="mt-14 flex flex-wrap items-center gap-4 border-t-2 border-[var(--ink)] pt-8">
        <p className="flex-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          Çayı demli, kapısı açık. Gelin, birlikte bakalım.
        </p>
        <Link
          href="/iletisim"
          className="bg-[var(--ink)] px-6 py-3.5 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)]"
        >
          Yol tarifi & iletişim
        </Link>
      </div>
    </div>
  );
}
