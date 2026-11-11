import Link from "next/link";
import { HeroEffects } from "./hero-effects";

/**
 * Hero: kritik metin Server Component (LCP), efektler client adası.
 */
export function HeroSection({
  line1,
  line2,
  line3,
  highlight,
  lead,
  whatsapp,
}: {
  line1: string;
  line2: string;
  line3: string;
  highlight: string;
  lead: string;
  whatsapp: string;
}) {
  const lines = [line1, line2, line3];

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden border-b border-[var(--line)]">
      <HeroEffects />

      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pb-24 pt-28 sm:px-6">
        <h1 className="display-1 max-w-[12ch] text-[var(--ink)]">
          {lines.map((line, i) => (
            <span key={i} className="block pb-[0.06em]">
              {highlight && line === highlight ? (
                <span className="relative inline-block">
                  {line}
                  <span
                    className="pointer-events-none absolute -bottom-[0.1em] left-0 h-[0.32em] w-full bg-[var(--accent)] opacity-85 mix-blend-multiply"
                    aria-hidden
                  />
                </span>
              ) : (
                line
              )}
            </span>
          ))}
        </h1>

        <div className="mt-10 max-w-xl">
          {/* LCP adayı olmasın diye küçük tut; asıl LCP h1 */}
          <p className="text-sm leading-relaxed text-[var(--ink-soft)] sm:text-lg">
            {lead}
          </p>
          <div className="pointer-events-auto mt-7 flex flex-wrap gap-3">
            <Link
              href="/urunler"
              className="block bg-[var(--ink)] px-6 py-3.5 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)]"
            >
              Kataloğa göz at
            </Link>
            {whatsapp ? (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="block border border-[var(--ink)] px-6 py-3.5 text-sm font-semibold transition hover:bg-[var(--accent)]"
              >
                WhatsApp&rsquo;tan yaz
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
