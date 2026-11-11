import type { Metadata } from "next";
import { getSettings } from "@db/queries";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi",
  description:
    "Online siparişlerde geçerli mesafeli satış sözleşmesi şablonu.",
  alternates: { canonical: "/mesafeli-satis-sozlesmesi" },
};

export default async function DistanceSalesPage() {
  const s = await getSettings();

  return (
    <LegalPage
      eyebrow="Yasal"
      title="Mesafeli Satış Sözleşmesi"
      updated="Kasım 2026"
    >
      <p>
        Bu metin, {s.shopName} üzerinden verilen online siparişlerde
        uygulanacak mesafeli satış sözleşmesinin <strong>şablonudur</strong>.
        E-ticaret özelliği yayına alınmadan önce nihai hâli hukuk danışmanı
        ile gözden geçirilmelidir.
      </p>

      <section>
        <h2>1. Taraflar</h2>
        <p>
          <strong>Satıcı:</strong> {s.shopName}, {s.address} {s.district} /{" "}
          {s.city}
          {s.phone ? (
            <>
              , Tel: {s.phone}
            </>
          ) : null}
          <br />
          <strong>Alıcı:</strong> Sipariş formunda bilgilerini veren kişi.
        </p>
      </section>

      <section>
        <h2>2. Konu</h2>
        <p>
          Alıcının, satıcının web sitesi üzerinden elektronik ortamda
          sipariş ettiği ürünlerin satışı ve teslimi ile ilgili tarafların
          hak ve yükümlülüklerinin belirlenmesidir. 6502 sayılı Tüketicinin
          Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
          hükümleri uygulanır.
        </p>
      </section>

      <section>
        <h2>3. Sipariş ve Ödeme</h2>
        <ul>
          <li>
            Sipariş, ödemenin onaylanmasıyla işleme alınır ve alıcıya
            sipariş numarası iletilir.
          </li>
          <li>
            Fiyatlar, sipariş anında sitede gösterilen Türk Lirası
            tutarlardır; kargo ücreti ayrıca bildirilir.
          </li>
          <li>
            Stokta bulunmayan ürün için alıcıya bilgi verilir; ücret iadesi
            veya alternatif ürün önerilir.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Teslimat</h2>
        <ul>
          <li>
            <strong>Kargo ile gönderim:</strong> ürünler en geç 3 iş günü
            içinde kargoya verilir; kargo süresi taşıyıcı firmaya bağlıdır.
          </li>
          <li>
            <strong>Mağazadan teslim:</strong> sipariş hazır olduğunda
            telefonla haber verilir; dükkân çalışma saatleri içinde teslim
            alınabilir.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Cayma Hakkı</h2>
        <p>
          Alıcı, ürünü teslim aldığı tarihten itibaren 14 gün içinde
          herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir.
          Ayrıntılar için{" "}
          <a href="/iade-degisim" className="underline">
            İade & Değişim
          </a>{" "}
          sayfasına bakınız.
        </p>
      </section>
    </LegalPage>
  );
}
