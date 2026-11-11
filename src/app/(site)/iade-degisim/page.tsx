import type { Metadata } from "next";
import { getSettings } from "@db/queries";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "İade & Değişim",
  description: "İade, değişim ve cayma hakkı koşulları şablonu.",
  alternates: { canonical: "/iade-degisim" },
};

export default async function ReturnsPage() {
  const s = await getSettings();

  return (
    <LegalPage eyebrow="Yasal" title="İade & Değişim" updated="Kasım 2026">
      <p>
        Bu sayfa, online siparişlerde uygulanacak iade ve değişim
        koşullarının <strong>şablonudur</strong>; e-ticaret yayına
        alınmadan önce nihai hâli gözden geçirilmelidir.
      </p>

      <section>
        <h2>1. Cayma Hakkı</h2>
        <p>
          Ürünü teslim aldığınız tarihten itibaren <strong>14 gün</strong>{" "}
          içinde gerekçe göstermeden iade edebilirsiniz. İadenin geçerli
          olması için ürünün kullanılmamış, ambalajının açılmamış ve
          yeniden satılabilir durumda olması gerekir.
        </p>
      </section>

      <section>
        <h2>2. Cayma Hakkının İstisnaları</h2>
        <ul>
          <li>Fotokopi, baskı ve ciltleme gibi kişiye özel üretilen işler</li>
          <li>Açılmış yazıcı kartuşu ve toner</li>
          <li>Hijyen nedeniyle iade edilemeyecek ürünler</li>
        </ul>
      </section>

      <section>
        <h2>3. Nasıl İade Ederim?</h2>
        <ul>
          <li>
            {s.phone ? (
              <>
                <strong>Telefon:</strong> {s.phone} numarasından bize
                ulaşın, iade kodunuzu alın.
              </>
            ) : (
              "Önce telefon veya e-posta ile bize ulaşın."
            )}
          </li>
          <li>
            <strong>Dükkândan:</strong> ürünü fiş veya sipariş numaranızla
            birlikte dükkâna getirebilirsiniz.
          </li>
          <li>
            <strong>Kargo ile:</strong> anlaşmalı kargo koduyla gönderim
            ücretsizdir; kargo ücreti bizden.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Ücret İadesi</h2>
        <p>
          İade onaylandıktan sonra ücret, ödemenin yapıldığı yöntemle{" "}
          <strong>10 iş günü</strong> içinde iade edilir. Bankanızın hesaba
          yansıtma süresi değişebilir.
        </p>
      </section>

      <section>
        <h2>5. Ayıplı Ürün</h2>
        <p>
          Hasarlı veya hatalı ürün gelirse fotoğrafıyla birlikte bize
          ulaşın; değişim veya tam iade sizin tercihinizdir, kargo ücreti
          bize aittir.
        </p>
      </section>
    </LegalPage>
  );
}
