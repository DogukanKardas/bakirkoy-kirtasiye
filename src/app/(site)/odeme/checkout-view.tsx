"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = ["İletişim", "Teslimat", "Ödeme", "Onay"] as const;

type Delivery = "cargo" | "pickup";

type Form = {
  name: string;
  email: string;
  phone: string;
  delivery: Delivery;
  address: string;
  city: string;
  note: string;
  cardHolder: string;
  cardNumber: string;
  cardExp: string;
  cardCvc: string;
  kvkk: boolean;
};

const INITIAL: Form = {
  name: "",
  email: "",
  phone: "",
  delivery: "cargo",
  address: "",
  city: "",
  note: "",
  cardHolder: "",
  cardNumber: "",
  cardExp: "",
  cardCvc: "",
  kvkk: false,
};

export function CheckoutView({
  shopAddress,
  shopPhone,
}: {
  shopAddress: string;
  shopPhone: string;
}) {
  const router = useRouter();
  const { items, total, resetLocal } = useCart();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(INITIAL);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (items.length === 0 && !busy) {
    return (
      <div className="mt-8">
        <p className="text-[var(--ink-soft)]">Sepetiniz boş.</p>
        <Link
          href="/urunler"
          className="mt-4 inline-block border-b border-[var(--ink)] text-sm font-medium hover:bg-[var(--accent)]"
        >
          Ürünlere git
        </Link>
      </div>
    );
  }

  const validateStep = (s: number): string => {
    if (s === 0) {
      if (form.name.trim().length < 2) return "Adınızı ve soyadınızı yazın";
      if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
        return "Geçerli bir e-posta yazın";
      if (form.phone.replace(/\D/g, "").length < 10)
        return "Geçerli bir telefon numarası yazın";
    }
    if (s === 1 && form.delivery === "cargo") {
      if (form.address.trim().length < 5) return "Teslimat adresinizi yazın";
      if (form.city.trim().length < 2) return "Şehir / ilçe yazın";
    }
    if (s === 2) {
      if (form.cardHolder.trim().length < 2) return "Kart üzerindeki adı yazın";
      if (form.cardNumber.replace(/\D/g, "").length < 15)
        return "Geçerli bir kart numarası yazın";
      if (!/^\d{2}\s?\/\s?\d{2}$/.test(form.cardExp.trim()))
        return "Son kullanma tarihini AA/YY biçiminde yazın";
      if (!/^\d{3,4}$/.test(form.cardCvc.trim())) return "CVC kodunu yazın";
    }
    if (s === 3 && !form.kvkk) return "Devam etmek için KVKK onayı gerekli";
    return "";
  };

  const next = () => {
    const err = validateStep(step);
    if (err) return setError(err);
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    const err = validateStep(3);
    if (err) return setError(err);
    setBusy(true);
    setError("");

    const [expMonth = "", expYear = ""] = form.cardExp.split("/").map((s) => s.trim());
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          delivery_method: form.delivery,
          address: form.address.trim(),
          city: form.city.trim(),
          note: form.note.trim(),
          payment: {
            card: {
              holder: form.cardHolder.trim(),
              number: form.cardNumber.replace(/\s/g, ""),
              expMonth,
              expYear,
              cvc: form.cardCvc.trim(),
            },
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sipariş oluşturulamadı");
        setBusy(false);
        // ödeme hatasıysa ödeme adımına geri dön
        if (res.status === 402) setStep(2);
        return;
      }
      resetLocal();
      router.push(`/siparis/${data.orderNumber}`);
    } catch {
      setError("Bağlantı hatası. Tekrar deneyin.");
      setBusy(false);
    }
  };

  return (
    <div className="mt-8">
      {/* adım göstergesi */}
      <ol className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[var(--line)] pb-4">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex items-center gap-2 text-sm ${
              i === step
                ? "font-semibold text-[var(--ink)]"
                : i < step
                  ? "text-[var(--ink-soft)]"
                  : "text-[var(--ink-muted)]"
            }`}
          >
            <span
              className={`grid h-6 w-6 place-items-center border font-[family-name:var(--font-mono)] text-[11px] ${
                i < step
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                  : i === step
                    ? "border-[var(--ink)] bg-[var(--accent)] text-[var(--ink)]"
                    : "border-[var(--line)]"
              }`}
            >
              {i < step ? "✓" : String(i + 1).padStart(2, "0")}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {step === 0 ? (
                <section className="space-y-4">
                  <h2 className="font-[family-name:var(--font-display)] text-xl">
                    Size nasıl ulaşalım?
                  </h2>
                  <Field label="Ad Soyad" value={form.name} onChange={(v) => set("name", v)} autoComplete="name" />
                  <Field label="E-posta" type="email" value={form.email} onChange={(v) => set("email", v)} autoComplete="email" />
                  <Field label="Telefon" value={form.phone} onChange={(v) => set("phone", v)} autoComplete="tel" placeholder="05xx xxx xx xx" />
                </section>
              ) : null}

              {step === 1 ? (
                <section className="space-y-4">
                  <h2 className="font-[family-name:var(--font-display)] text-xl">
                    Nasıl teslim almak istersiniz?
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DeliveryCard
                      active={form.delivery === "cargo"}
                      onClick={() => set("delivery", "cargo")}
                      title="Kargo ile gönderim"
                      desc="Adresinize kargoyla gönderelim; kargo ücreti dükkândan onaylanır."
                    />
                    <DeliveryCard
                      active={form.delivery === "pickup"}
                      onClick={() => set("delivery", "pickup")}
                      title="Mağazadan teslim"
                      desc="Siparişinizi hazırlayalım, dükkândan elden alın."
                    />
                  </div>
                  {form.delivery === "cargo" ? (
                    <>
                      <label className="block text-sm">
                        <span className="mb-1 block text-[var(--ink-soft)]">Adres</span>
                        <textarea
                          value={form.address}
                          onChange={(e) => set("address", e.target.value)}
                          rows={3}
                          className="w-full border border-[var(--line)] bg-transparent px-3 py-2 outline-none focus:border-[var(--ink)]"
                        />
                      </label>
                      <Field label="İlçe / Şehir" value={form.city} onChange={(v) => set("city", v)} />
                    </>
                  ) : (
                    <div className="border border-[var(--line)] bg-[var(--paper-deep)]/50 p-4 text-sm text-[var(--ink-soft)]">
                      <p className="font-medium text-[var(--ink)]">Teslim adresi</p>
                      <p className="mt-1">{shopAddress}</p>
                      {shopPhone ? <p className="mt-1">{shopPhone}</p> : null}
                      <p className="mt-2 text-xs text-[var(--ink-muted)]">
                        Siparişiniz hazır olunca telefonla haber veririz.
                      </p>
                    </div>
                  )}
                  <label className="block text-sm">
                    <span className="mb-1 block text-[var(--ink-soft)]">Sipariş notu (ops.)</span>
                    <textarea
                      value={form.note}
                      onChange={(e) => set("note", e.target.value)}
                      rows={2}
                      className="w-full border border-[var(--line)] bg-transparent px-3 py-2 outline-none focus:border-[var(--ink)]"
                    />
                  </label>
                </section>
              ) : null}

              {step === 2 ? (
                <section className="space-y-4">
                  <h2 className="font-[family-name:var(--font-display)] text-xl">
                    Kart ile ödeme
                  </h2>
                  <p className="inline-flex items-center gap-2 border border-[var(--accent-2)]/40 bg-[var(--accent-2)]/10 px-3 py-1.5 text-xs font-medium text-[var(--accent-2)]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                    Test modu — gerçek tahsilat yapılmaz. Reddedilen kart senaryosu: 4000 0000 0000 0002
                  </p>
                  <Field label="Kart üzerindeki ad" value={form.cardHolder} onChange={(v) => set("cardHolder", v)} autoComplete="cc-name" />
                  <Field
                    label="Kart numarası"
                    value={form.cardNumber}
                    onChange={(v) =>
                      set(
                        "cardNumber",
                        v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "),
                      )
                    }
                    placeholder="4000 0000 0000 0001"
                    inputMode="numeric"
                    autoComplete="cc-number"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Son kullanma (AA/YY)"
                      value={form.cardExp}
                      onChange={(v) => {
                        const d = v.replace(/\D/g, "").slice(0, 4);
                        set("cardExp", d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                      }}
                      placeholder="12/28"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                    />
                    <Field
                      label="CVC"
                      value={form.cardCvc}
                      onChange={(v) => set("cardCvc", v.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                    />
                  </div>
                  <p className="text-xs text-[var(--ink-muted)]">
                    Kart bilgileriniz yalnızca ödeme denemesi için kullanılır;
                    sitemizde saklanmaz.
                  </p>
                </section>
              ) : null}

              {step === 3 ? (
                <section className="space-y-5">
                  <h2 className="font-[family-name:var(--font-display)] text-xl">
                    Son bir bakış
                  </h2>
                  <dl className="space-y-3 border border-[var(--line)] p-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--ink-muted)]">İletişim</dt>
                      <dd className="text-right">
                        {form.name}
                        <br />
                        <span className="text-[var(--ink-soft)]">{form.email} · {form.phone}</span>
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-[var(--line)] pt-3">
                      <dt className="text-[var(--ink-muted)]">Teslimat</dt>
                      <dd className="text-right">
                        {form.delivery === "cargo" ? (
                          <>
                            Kargo ile
                            <br />
                            <span className="text-[var(--ink-soft)]">{form.address}, {form.city}</span>
                          </>
                        ) : (
                          <>
                            Mağazadan teslim
                            <br />
                            <span className="text-[var(--ink-soft)]">{shopAddress}</span>
                          </>
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-[var(--line)] pt-3">
                      <dt className="text-[var(--ink-muted)]">Kart</dt>
                      <dd className="font-[family-name:var(--font-mono)]">
                        •••• {form.cardNumber.replace(/\s/g, "").slice(-4)}
                      </dd>
                    </div>
                  </dl>
                  <label className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-relaxed text-[var(--ink-soft)]">
                    <input
                      type="checkbox"
                      checked={form.kvkk}
                      onChange={(e) => set("kvkk", e.target.checked)}
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--ink)]"
                    />
                    <span>
                      Adım, iletişim ve adres bilgilerimin siparişimin
                      hazırlanması ve teslimi amacıyla işlenmesini{" "}
                      <Link href="/kvkk" className="underline">
                        KVKK aydınlatma metni
                      </Link>{" "}
                      kapsamında kabul ediyorum.
                    </span>
                  </label>
                </section>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {error ? (
            <p className="mt-4 border border-red-700/40 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={step === 0 || busy}
              className="border border-[var(--line)] px-5 py-3 text-sm font-medium transition hover:border-[var(--ink)] disabled:opacity-40"
            >
              ← Geri
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)]"
              >
                Devam →
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-2)] disabled:opacity-60"
              >
                {busy ? "Ödeme yapılıyor…" : `Siparişi onayla ve öde · ${formatPrice(total)}`}
              </button>
            )}
          </div>
        </div>

        {/* özet */}
        <aside className="h-fit border border-[var(--line)] p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl">Sepet özeti</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <li
                key={item.productId}
                className="flex justify-between gap-3 text-[var(--ink-soft)]"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="font-[family-name:var(--font-mono)]">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-[var(--line)] pt-4">
            <span className="price-tag">Toplam {formatPrice(total)}</span>
          </p>
          <p className="mt-3 text-xs text-[var(--ink-muted)]">
            Kargo ile gönderimde kargo ücreti dükkân tarafından onaylanır.
          </p>
        </aside>
      </div>
    </div>
  );
}

function DeliveryCard({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border p-4 text-left transition ${
        active
          ? "border-[var(--ink)] bg-[var(--accent)]/25"
          : "border-[var(--line)] hover:border-[var(--ink)]"
      }`}
    >
      <span className="flex items-center gap-2 font-medium">
        <span
          className={`grid h-4 w-4 place-items-center rounded-full border ${
            active ? "border-[var(--ink)] bg-[var(--ink)]" : "border-[var(--ink-muted)]"
          }`}
          aria-hidden
        >
          {active ? <span className="h-1.5 w-1.5 rounded-full bg-[var(--paper)]" /> : null}
        </span>
        {title}
      </span>
      <span className="mt-1.5 block text-xs leading-relaxed text-[var(--ink-soft)]">
        {desc}
      </span>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  inputMode,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  inputMode?: "numeric" | "tel" | "email";
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-[var(--ink-soft)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="w-full border border-[var(--line)] bg-transparent px-3 py-2 outline-none focus:border-[var(--ink)]"
      />
    </label>
  );
}
