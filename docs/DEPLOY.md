# Yayına Alma Rehberi

Bakırköy Kırtasiye sitesini Vercel + Supabase ile canlıya almak için adımlar.

## 1. Ortam değişkenleri

Vercel projesi → **Settings → Environment Variables**. Production (ve Preview) için doldurun:

| Değişken | Açıklama |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canlı adres, örn. `https://bakirkoykirtasiye.com` (sonunda `/` yok) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Varsa publishable key; yoksa anon ile aynı olabilir |
| `ADMIN_API_SECRET` | Admin RPC’ler için uzun rastgele secret |
| `ADMIN_JWT_SECRET` | Oturum imzası için uzun rastgele secret |
| `ADMIN_EMAIL` | Gömülü admin e-posta (örn. `kardasdogukan@outlook.com`) |
| `ADMIN_PASSWORD` | Gömülü admin şifresi — panelden şifre olmadan giriş |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **service_role** key (secret; public etme) |
| `PAYMENT_PROVIDER` | `test` (varsayılan) — canlı anahtar bağlamadan bırakın |

Ödeme sağlayıcı anahtarları (`IYZICO_*`, `PAYTR_*`) yalnızca e-ticaret gerçekten açılacaksa eklenir. Yerel şablon: `.env.example`.

## 2. Supabase production

1. [supabase.com](https://supabase.com) → proje seçili olduğundan emin olun (veya ayrı production projesi açın).
2. **Authentication → URL Configuration**:
   - **Site URL** = `https://alanadiniz` (örn. `https://bakirkoy-kirtasiye.vercel.app`)
   - **Redirect URLs** = `https://alanadiniz/auth/callback` ve `https://alanadiniz/**`
   - Şifre yenileme / magic link `/auth/callback` üzerinden işlenir; eski mailleri kullanmayın.
3. **Storage**: `product-images` (veya kullandığınız bucket) public okuma politikasının açık olduğunu doğrulayın.
4. **Database**: Geliştirmede uygulanan migration’ların production’da da uygulandığını kontrol edin (SQL Editor veya CLI `supabase db push`).
5. RLS açık kalsın; anon key ile yalnızca public okuma + public RPC’ler çalışmalı.
6. Admin kullanıcısı: Auth’ta e-posta/şifre kullanıcısı + `profiles` / staff rolü production’da da mevcut olsun.

## 3. Vercel’e deploy

```bash
# Bir kez: Vercel CLI ile giriş ve proje bağlama
npx vercel login
npx vercel link

# Production deploy
npx vercel --prod
```

Alternatif: GitHub/Origin reposunu Vercel’e bağlayın; `main` branch’e push → otomatik Production.

Build komutu: `npm run build` (varsayılan). Node 20+ önerilir.

## 4. Alan adı bağlama

1. Vercel → Project → **Settings → Domains** → alan adını ekleyin.
2. DNS’te (alan adı sağlayıcınızda):
   - Apex (`@`): Vercel’in verdiği A kaydı **veya** CNAME `cname.vercel-dns.com`
   - `www`: CNAME → `cname.vercel-dns.com`
3. SSL otomatik oluşur; yeşil tik görünene kadar bekleyin.
4. `NEXT_PUBLIC_SITE_URL` değerini kesin adrese güncelleyip yeniden deploy edin (sitemap/canonical doğru olsun).

## 5. Canlı kontrol listesi

- [ ] Ana sayfa, `/urunler`, `/iletisim` 200
- [ ] `/sitemap.xml` ve `/robots.txt` açılıyor
- [ ] `/kvkk`, `/cerez-politikasi` erişilebilir
- [ ] Admin girişi (`/admin/giris`) çalışıyor
- [ ] `commerce_enabled` kapalıysa `/sepet` 404; açınca sepet butonu görünüyor
- [ ] Ürün paylaşımında OG kartı (dinamik) sosyal önizlemede geliyor

## 6. E-ticareti açmadan önce

1. Admin → Ayarlar → Satış → **E-ticareti etkinleştir** (henüz açmayın).
2. `PAYMENT_PROVIDER` + iyzico/PayTR anahtarlarını Production env’e yazın, redeploy.
3. `/mesafeli-satis-sozlesmesi` ve `/iade-degisim` metinlerini hukuk danışmanıyla netleştirin.
4. Test siparişi (sandbox) → Admin Siparişler → stok düşüşü doğrulayın.
5. Sonra bayrağı açın.
