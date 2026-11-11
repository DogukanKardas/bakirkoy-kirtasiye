# Bakırköy Kırtasiye

Kırtasiye e-ticaret vitrini + stok/ürün yönetim paneli.

## Özellikler

- Ürün kataloğu ve detay sayfaları
- Sepet ve sipariş (stok otomatik düşer)
- Admin paneli: ürün ekleme, stok güncelleme, sipariş listesi

## Kurulum

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Site: [http://localhost:3000](http://localhost:3000)  
Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

**Admin giriş:** `admin@bakirkoy.com` / `admin123`
# bakirkoy-kirtasiye
