# Yönetim Paneli Kullanım Kılavuzu

Bu kısa rehber, dükkân sahibinin siteyi kendi başına yönetmesi içindir.  
Adres: sitenizin `/admin` sayfası (ör. `https://alanadiniz.com/admin`).

Giriş: size verilen e-posta ve şifre ile **Yönetim** sayfasından giriş yapın.

---

## Her gün ne bakılır?

1. **Panel** — Üstte özet kartlar: kaç ürün var, stokta olmayanlar, yeni liste talepleri.
2. **Liste Talepleri** — Müşteri WhatsApp veya formla liste gönderdiyse burada görünür. Durumu “hazırlanıyor / tamamlandı” diye güncelleyin.
3. **Mesajlar** — İletişim formundan gelen notlar.
4. **Siparişler** — Yalnızca e-ticaret açıksa menüde görünür. Yeni sipariş varsa yanındaki sayıya bakın.

---

## Ürün eklemek / düzenlemek

1. Sol menüden **Ürünler** → **Yeni Ürün** (veya mevcut ürüne tıklayın).
2. Ad, fiyat, stok, kategori, marka doldurun.
3. Görsel yükleyin (mümkünse net, kareye yakın fotoğraf).
4. **Kaydet**.

**Toplu ekleme:** Ürünler → **Excel ile İçe Aktar**. Şablonu indirin, doldurun, yükleyin.

Stok bitince ürün “Tükendi” yazar; stok sayısını artırınca tekrar satışa çıkar.

---

## Kategori, marka, koleksiyon

- **Kategoriler:** Raflar gibi düşünün (Kalemler, Defterler…). Sıra sürükle-bırak ile değişir.
- **Markalar:** Faber-Castell, Stabilo vb. Logo ekleyebilirsiniz.
- **Koleksiyonlar:** “Okul sezonu”, “Ofis seti” gibi vitrin grupları. Ürünleri koleksiyona ekleyin; ana sayfada veya `/koleksiyon/...` adresinde görünür.  
  Okul listesi olarak işaretlerseniz **Listem** sayfasında hazır liste olarak çıkar.

---

## Ana sayfa ve hizmetler

- **Ana Sayfa:** Hangi blokların (kahraman yazı, öne çıkan ürünler, dükkân haritası…) görüneceğini ve sırasını buradan ayarlayın.
- **Hizmetler:** Fotokopi, baskı, ciltleme vb. fiyat ve açıklama; sitede Hizmetler sayfasına yansır.

---

## Ayarlar (dükkân kimliği)

**Ayarlar** → sekmeler:

| Sekme | Ne işe yarar |
|---|---|
| Marka | Dükkân adı, slogan, logo, renkler |
| İletişim | Telefon, WhatsApp, e-posta, adres, harita |
| Çalışma Saatleri | Günlük açılış–kapanış; özel gün istisnaları |
| Sosyal & Duyuru | Instagram / Facebook |
| Satış | Fiyatları göster / gizle; **E-ticareti aç/kapa** |

Değişiklikten sonra mutlaka **Tümünü Kaydet**. E-ticareti açarken onay sorar — ödeme altyapınız hazır değilse kapalı bırakın.

---

## E-ticaret (isteğe bağlı)

Kapalıyken müşteri **Listeme Ekle** kullanır; WhatsApp veya formla sipariş gelir.  
Açıksa sepet, ödeme ve **Siparişler** menüsü çalışır.

Sipariş geldiğinde:
1. **Siparişler** listesinden siparişe girin.
2. Durumu güncelleyin: bekliyor → hazırlanıyor → kargoda / teslim edildi.
3. Ödeme “başarılı” görünüyorsa tahsilat tamamdır (test modunda gerçek para çekilmez).

---

## Kullanıcılar

Yalnızca **yönetici** rolü yeni personel ekleyebilir.  
Her çalışana ayrı e-posta/şifre verin; ortak hesap kullanmayın.

---

## Sık sorunlar

| Durum | Ne yapın |
|---|---|
| Site eski bilgiyi gösteriyor | Ayarları bir kez kaydedin veya birkaç saniye bekleyip yenileyin |
| Fotoğraf yüklenmiyor | Dosya boyutu çok büyükse küçültün (JPG/WebP, mümkünse &lt; 2 MB) |
| Giriş yapamıyorum | Şifreyi sıfırlamak için geliştiriciye / hosting yetkilisine yazın |
| Sepet görünmüyor | Ayarlar → Satış → E-ticaret kapalıdır; bilinçliyse sorun değil |

---

## Yasal sayfalar (bilgi)

Sitede **KVKK**, **Çerezler**, e-ticaret açıksa **Satış Sözleşmesi** ve **İade & Değişim** linkleri vardır. Metinler şablondur; avukatınızla gözden geçirmeniz önerilir.

---

İyi satışlar. Takıldığınız yerde bu kılavuzu veya geliştiricinizi arayın.
