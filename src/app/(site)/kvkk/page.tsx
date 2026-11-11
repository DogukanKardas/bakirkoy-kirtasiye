import type { Metadata } from "next";
import { getSettings } from "@db/queries";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description:
    "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
  alternates: { canonical: "/kvkk" },
};

export default async function KvkkPage() {
  const s = await getSettings();

  return (
    <LegalPage
      eyebrow="Yasal"
      title="KVKK Aydınlatma Metni"
      updated="Kasım 2026"
    >
      <p>
        Bu aydınlatma metni, <strong>{s.shopName}</strong> ("Veri Sorumlusu")
        tarafından, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun
        ("KVKK") 10. maddesi uyarınca hazırlanmıştır.
      </p>

      <section>
        <h2>1. Veri Sorumlusu</h2>
        <p>
          <strong>{s.shopName}</strong>
          <br />
          {s.address} {s.district} / {s.city}
          <br />
          {s.email ? <>E-posta: {s.email}</> : null}
          {s.phone ? (
            <>
              <br />
              Telefon: {s.phone}
            </>
          ) : null}
        </p>
      </section>

      <section>
        <h2>2. İşlenen Kişisel Veriler ve Amaçları</h2>
        <p>Aşağıdaki kişisel verileriniz, belirtilen amaçlarla işlenir:</p>
        <ul>
          <li>
            <strong>İletişim formu:</strong> ad ve e-posta adresiniz; yalnızca
            mesajınıza yanıt vermek amacıyla.
          </li>
          <li>
            <strong>Okul listesi talepleri:</strong> ad, telefon numarası ve
            yüklediğiniz liste görseli; talebinizin hazırlanması ve size
            ulaşılması amacıyla.
          </li>
          <li>
            <strong>Online sipariş (e-ticaret açıkken):</strong> ad, telefon,
            e-posta ve teslimat adresi; siparişinizin hazırlanması, teslimi ve
            yasal yükümlülüklerin yerine getirilmesi amacıyla.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Hukuki Sebepler</h2>
        <p>
          Verileriniz; KVKK'nın 5. maddesindeki "bir sözleşmenin kurulması
          veya ifası", "veri sorumlusunun hukuki yükümlülüğü" ve ilgili
          formlarda verdiğiniz <strong>açık rızanız</strong> hukuki
          sebeplerine dayanılarak işlenir.
        </p>
      </section>

      <section>
        <h2>4. Aktarım ve Saklama</h2>
        <p>
          Verileriniz yurt içindeki güvenli sunucularda saklanır; hizmet
          alınan altyapı sağlayıcıları (barındırma, e-posta) dışında üçüncü
          kişilerle paylaşılmaz. Yasal saklama süreleri dolunca silinir veya
          anonim hâle getirilir.
        </p>
      </section>

      <section>
        <h2>5. Haklarınız</h2>
        <p>
          KVKK'nın 11. maddesi uyarınca; verilerinize erişme, düzeltilmesini
          veya silinmesini isteme, işlemeye itiraz etme haklarına
          sahipsiniz. Taleplerinizi{" "}
          {s.email ? (
            <a href={`mailto:${s.email}`} className="underline">
              {s.email}
            </a>
          ) : (
            "dükkân e-postamıza"
          )}{" "}
          adresine iletebilirsiniz; en geç 30 gün içinde yanıtlanır.
        </p>
      </section>
    </LegalPage>
  );
}
