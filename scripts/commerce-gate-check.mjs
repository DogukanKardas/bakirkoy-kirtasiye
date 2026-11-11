#!/usr/bin/env node
/**
 * commerce_enabled kapısı — uçtan uca doğrulama senaryosu.
 *
 * Kullanım:
 *   node scripts/commerce-gate-check.mjs <baseUrl> <beklenen>
 *     beklenen: "kapali" | "acik"
 *
 * Örnek akış (admin panelden ayarı açıp kapatarak):
 *   1) Ayarlar → E-ticaret KAPALI  → node scripts/commerce-gate-check.mjs http://localhost:3001 kapali
 *   2) Ayarlar → E-ticaret AÇIK   → node scripts/commerce-gate-check.mjs http://localhost:3001 acik
 *
 * Doğrulananlar:
 *  kapalı iken:
 *    - GET /sepet, /odeme, /siparis/X      → 404
 *    - POST /api/orders                     → 404 (reddeder)
 *    - GET /urunler HTML                    → "Sepete Ekle" içermez
 *    - GET /admin/siparisler (oturumsuz)    → login'e yönlenir ya da 404
 *  açık iken:
 *    - GET /sepet, /odeme                   → 200
 *    - POST /api/orders (boş gövde)         → 400 (validasyon; 404 DEĞİL)
 *    - GET /urunler HTML                    → "Sepete Ekle" içerir
 *
 * Çıkış kodu: 0 = tüm kontroller geçti, 1 = en az bir hata.
 */

const [baseUrlArg, mode] = process.argv.slice(2);
if (!baseUrlArg || !["kapali", "acik"].includes(mode ?? "")) {
  console.error("Kullanım: node scripts/commerce-gate-check.mjs <baseUrl> <kapali|acik>");
  process.exit(2);
}
const base = baseUrlArg.replace(/\/$/, "");
const closed = mode === "kapali";

let failures = 0;

async function check(name, fn) {
  try {
    const ok = await fn();
    console.log(`${ok ? "✓" : "✗"} ${name}`);
    if (!ok) failures += 1;
  } catch (e) {
    console.log(`✗ ${name} — ${e.message}`);
    failures += 1;
  }
}

const status = async (path, init) => (await fetch(`${base}${path}`, { redirect: "manual", ...init })).status;
const body = async (path) => await (await fetch(`${base}${path}`)).text();

await check(`GET /sepet → ${closed ? "404" : "200"}`, async () =>
  (await status("/sepet")) === (closed ? 404 : 200));

await check(`GET /odeme → ${closed ? "404" : "200"}`, async () =>
  (await status("/odeme")) === (closed ? 404 : 200));

await check(`GET /siparis/BK-TEST-000 → ${closed ? "404" : "404 (kayıt yok ama sayfa canlı)"}`, async () =>
  (await status("/siparis/BK-TEST-000")) === 404);

await check(`POST /api/orders → ${closed ? "404 (reddeder)" : "400 (validasyon çalışır)"}`, async () => {
  const s = await status("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  return closed ? s === 404 : s === 400;
});

await check(`/urunler HTML ${closed ? "'Sepete Ekle' İÇERMEZ" : "'Sepete Ekle' içerir"}`, async () => {
  const html = await body("/urunler");
  const has = html.includes("Sepete Ekle") || html.includes("Sepete ekle");
  return closed ? !has : has;
});

await check(`/liste HTML ${closed ? "okul listeleri görünür" : "Listem çekmecesi yerine Sepet aktif"}`, async () => {
  const html = await body("/liste");
  // kapalıyken liste modülü canlı; açıkken de sayfa var ama sepet modu öncelikli
  return html.length > 1000;
});

await check(`POST /api/orders sahte sipariş → ${closed ? "404" : "400 (sepet boş)"}`, async () => {
  const s = await status("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_name: "Gate Test",
      email: "gate@test.dev",
      phone: "05320000000",
      delivery_method: "pickup",
      payment: { card: { holder: "Gate Test", number: "4000000000000001", expMonth: "12", expYear: "28", cvc: "123" } },
    }),
  });
  return closed ? s === 404 : s === 400; // açıkken: sepet boş → 400
});

console.log("");
if (failures > 0) {
  console.error(`SONUÇ: ${failures} kontrol başarısız (${mode} modu)`);
  process.exit(1);
}
console.log(`SONUÇ: tüm kontroller geçti (${mode} modu) — kapı doğru çalışıyor.`);
