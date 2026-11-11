"use client";

import { motion } from "motion/react";
import type { Settings } from "@db/queries";

const EASE = [0.16, 1, 0.3, 1] as const;

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Editoryal hikâye düzeni: görsel + metin ritmi, büyük çekme söz,
 * tipografik "raf" panelleri (atmosfer fotoğrafları eklendikçe yerini alır).
 */
export function Story({ settings }: { settings: Settings }) {
  return (
    <div className="mt-12 space-y-16">
      {/* 1. perde: giriş paragrafı + tipografik panel */}
      <div className="grid items-start gap-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <p className="font-[family-name:var(--font-display)] text-2xl leading-snug text-[var(--ink)] sm:text-3xl">
            {settings.shopName}, {settings.district}&rsquo;de kalemle
            defterin hâlâ elle seçildiği, raftaki her ürünün bir hikâyesi
            olduğuna inanan küçük bir dükkân.
          </p>
          <p className="mt-6 max-w-xl leading-relaxed text-[var(--ink-soft)]">
            İlk gün açtığımızda rafta üç çeşit defter, bir kutu kurşun kalem
            vardı. Bugün duvarlar rafa, raflar komşularımızın alışkanlıklarına
            dönüştü. Hangi öğretmen hangi kalemi ister, hangi öğrenci hangi
            defterin kâğıdını sever — biliriz, çünkü yıllardır aynı
            sohbetleri ediyoruz.
          </p>
        </Reveal>
        <Reveal delay={0.12} className="lg:col-span-5">
          <div className="ruled flex aspect-[4/5] items-center justify-center border border-[var(--line)] bg-[var(--paper-deep)]">
            <span className="font-[family-name:var(--font-display)] text-[10rem] leading-none text-[var(--ink)] opacity-[0.12]">
              {settings.shopName.charAt(0)}
            </span>
          </div>
          <p className="mt-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            Köşedeki dükkân · {settings.district}
          </p>
        </Reveal>
      </div>

      {/* 2. perde: çekme söz */}
      <Reveal>
        <blockquote className="border-y-2 border-[var(--ink)] py-10 text-center">
          <p className="mx-auto max-w-3xl font-[family-name:var(--font-display)] text-3xl leading-tight text-[var(--ink)] sm:text-4xl">
            &ldquo;Kalemi eline alıp denemeden, defterin kâğıdına parmak
            ucuyla dokunmadan alışveriş olmaz.&rdquo;
          </p>
          <cite className="mt-4 block font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] not-italic text-[var(--ink-muted)]">
            — dükkânın ilk günkü sözü
          </cite>
        </blockquote>
      </Reveal>

      {/* 3. perde: üç değer */}
      <div className="grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3">
        {[
          {
            n: "01",
            t: "Tek tek seçilmiş raf",
            d: "Her ürünü önce biz deneriz. Kâğıdı kokusundan, kalemi yazısından anlarız; beğenmediğimizi rafa koymayız.",
          },
          {
            n: "02",
            t: "Mahallenin hafızası",
            d: "Okul listesi mi var? Öğretmenin hangi markayı sevdiğini biliriz. Listeyi bırakın, biz toplayalım.",
          },
          {
            n: "03",
            t: "Babalarımızdan kalan usul",
            d: "Fiyatı etikete el yazısıyla yazar, hesabı kâğıda dökeriz. Yavaş değil; özenli.",
          },
        ].map((v, i) => (
          <Reveal key={v.n} delay={i * 0.08} className="bg-[var(--paper)]">
            <div className="p-6">
              <p
                className="font-[family-name:var(--font-display)] text-5xl leading-none text-transparent"
                style={{ WebkitTextStroke: "1.2px var(--ink)" }}
              >
                {v.n}
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                {v.t}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
                {v.d}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* 4. perde: kapanış paragrafı */}
      <Reveal>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex aspect-[5/4] items-end border border-[var(--line)] bg-[var(--paper-deep)] p-5">
              <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                {settings.address}
                <br />
                {settings.district} / {settings.city}
              </p>
            </div>
          </div>
          <div className="flex items-center lg:col-span-7">
            <p className="max-w-xl text-lg leading-relaxed text-[var(--ink-soft)]">
              İnternet sitesi yaptık ama usulümüz değişmedi: burada gördüğünüz
              her ürün dükkândaki rafta duruyor. Listeyi gönderin toplayalım,
              geldiğinizde çayın yanında paketinizi verelim.{" "}
              <span className="highlight font-medium text-[var(--ink)]">
                Bizce kırtasiye, mahallenin kırtasiyesidir.
              </span>
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
