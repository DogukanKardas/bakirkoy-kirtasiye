import type { Metadata } from "next";
import { getSettings } from "@db/queries";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description:
    "Bu sitede kullanılan çerezler: yalnızca zorunlu çerezler ve tercihleriniz.",
  alternates: { canonical: "/cerez-politikasi" },
};

export default async function CookiePolicyPage() {
  const s = await getSettings();

  return (
    <LegalPage
      eyebrow="Yasal"
      title="Çerez Politikası"
      updated="Kasım 2026"
    >
      <p>
        {s.shopName} web sitesi, deneyiminizi çalışır hâlde tutmak için
        çerezler ve tarayıcınızın yerel depolamasını kullanır. Takip veya
        reklam çerezi <strong>kullanmayız</strong>.
      </p>

      <section>
        <h2>1. Zorunlu Çerezler</h2>
        <p>Sitenin çalışması için gereklidir; kapatılamazlar.</p>
        <ul>
          <li>
            <strong>Sepet çerezi</strong> (e-ticaret açıkken): sepetinizi
            tarayıcınızda hatırlar, 180 gün saklanır, yalnızca sunucumuz
            okuyabilir.
          </li>
          <li>
            <strong>Çerez tercihi:</strong> bu band üzerinde verdiğiniz karar
            tarayıcınızda saklanır.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Tercih Depolaması (çerez değildir)</h2>
        <p>
          "Listem" içeriği ve arayüz tercihleriniz (ör. liste görünümü)
          tarayıcınızın <em>yerel depolamasında</em> tutulur; sunucuya
          gönderilmez. Tarayıcı verilerinizi temizlerseniz silinir.
        </p>
      </section>

      <section>
        <h2>3. Üçüncü Taraf Çerezler</h2>
        <p>
          Kullanılmaz. Harita gibi gömülü içerikler yalnızca sayfayı
          ziyaret ettiğinizde ilgili sağlayıcıdan yüklenir; bu
          sağlayıcıların kendi çerez politikaları geçerlidir.
        </p>
      </section>

      <section>
        <h2>4. Tercihlerinizi Yönetme</h2>
        <p>
          Çerez bandındaki tercihinizi dilediğinizde tarayıcı ayarlarından
          site verilerini temizleyerek sıfırlayabilirsiniz; band yeniden
          görünür.
        </p>
      </section>
    </LegalPage>
  );
}
