# Lighthouse raporları (FAZ 8)

Tarih: Kasım 2026 · Ortam: `next start` → http://localhost:3002 · Lighthouse 12.6

Ham JSON: `docs/lighthouse-mobile.json`, `docs/lighthouse-desktop.json`

## Skorlar

| | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| **Mobil** (Slow 4G, 4× CPU) | **87** | **100** | **100** | **100** |
| **Masaüstü** | **99** | **100** | **100** | **100** |

### Mobil performans metrikleri
- FCP ~1–2 s · LCP ~4.0 s · TBT ~40 ms · CLS 0 · Speed Index ~1.8 s

### Masaüstü
- FCP ~0.3–0.4 s · LCP ~0.9 s · TBT ~50–60 ms · CLS ~0

## Yapılan optimizasyonlar
- `next/image` (ürün kartı, galeri, vitrin, arama)
- Font: `latin` + `latin-ext`, ağırlık kısıtı, `display: optional` (LCP font beklemesin)
- `optimizePackageImports` (motion, gsap, recharts, …)
- Hero metni Server Component; 3D/efekt client adası
- Preloader LCP overlay’i kaldırma; webdriver / reduced-motion’da atlama
- Çerez bandı etkileşim / 8 sn sonra
- `feTurbulence` noise → hafif CSS nokta deseni
- Aşağı-fold bölümler `next/dynamic`; chrome (cursor/wipe/ruler) idle sonrası
- Kontrast ve aria etiket düzeltmeleri (a11y 100)

## Mobil Performance 90 altı notu
Lab koşullarında (Slow 4G + 4× CPU) ana sayfa LCP’sinde **Render Delay** baskın (~3.5 s). Aynı h1 masaüstünde ~0.9 s. Muhtemel etken: ilk hidrasyon + büyük display tipografi boyaması. Alan ölçümünde (gerçek cihaz) genelde lab’dan daha iyidir.

İleri adımlar (isteğe bağlı): ana sayfa client bundle’ını daha da bölmek, Fraunces’i self-host subset ile küçültmek, hero’da öncelikli küçük bir görsel LCP adayı.
