import type { PaymentProvider, PaymentRequest, PaymentResult } from "./types";

/**
 * Test (sahte) ödeme sağlayıcısı — gerçek para hareketi olmaz.
 *
 * Deterministik kurallar (kart numarası boşluklardan arındırılır):
 *  - "4000 0000 0000 0002"  → ödeme reddedilir (banka hatası simülasyonu)
 *  - diğer tüm 16 haneli kartlar → ödeme başarılı
 *
 * Böylece uçtan uca akış (başarı + hata + stok iadesi) canlı anahtar
 * olmadan test edilebilir.
 */
export class FakePaymentProvider implements PaymentProvider {
  readonly key = "test";
  readonly label = "Test Modu (Sahte Ödeme)";
  readonly testMode = true;

  async createPayment(req: PaymentRequest): Promise<PaymentResult> {
    // Gerçek bir ağ gecikmesi hissi
    await new Promise((r) => setTimeout(r, 600));

    const digits = (req.card?.number ?? "").replace(/\D/g, "");
    if (!req.card || digits.length < 15) {
      return { ok: false, status: "failed", error: "Kart bilgileri eksik" };
    }
    if (digits === "4000000000000002") {
      return {
        ok: false,
        status: "failed",
        error: "Bankanız ödemeyi reddetti (test senaryosu)",
        transactionId: `test_declined_${crypto.randomUUID().slice(0, 8)}`,
      };
    }
    return {
      ok: true,
      status: "paid",
      transactionId: `test_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`,
    };
  }

  async refund(transactionId: string) {
    return { ok: true, transactionId };
  }
}
