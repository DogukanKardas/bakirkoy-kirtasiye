import type { PaymentProvider, PaymentRequest, PaymentResult } from "./types";

export type PaytrConfig = {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  /** "1" = test, "0" = canlı */
  testMode: string;
};

/**
 * PayTR adaptörü — İSKELET.
 *
 * Canlı anahtarlar bilinçli olarak BAĞLANMADI: `createPayment` şimdilik
 * her zaman "entegrasyon bekleniyor" hatası döner. Gerçek entegrasyonda:
 *
 *  1. PayTR iFrame token'ı üretilir (paytr_token, HMAC-SHA256 imzalı
 *     istek: merchant_id + user_ip + merchant_oid + email + amount + …).
 *  2. Ödeme iFrame'de tamamlanır; sonuç PayTR webhook'una düşer:
 *     POST /api/payments/paytr/callback → HMAC doğrulaması →
 *     admin_mark_order_paid / admin_mark_order_failed RPC'leri.
 *  3. `merchant_oid` olarak orderNumber kullanılır; callback'te sipariş
 *     bu numarayla bulunur.
 */
export class PaytrPaymentProvider implements PaymentProvider {
  readonly key = "paytr";
  readonly label = "PayTR";
  readonly testMode = false;

  constructor(private readonly config: PaytrConfig) {
    if (!config.merchantId || !config.merchantKey || !config.merchantSalt) {
      throw new Error("PayTR yapılandırması eksik (PAYTR_MERCHANT_ID / PAYTR_MERCHANT_KEY / PAYTR_MERCHANT_SALT)");
    }
  }

  async createPayment(_req: PaymentRequest): Promise<PaymentResult> {
    void this.config; // iskelet: yapılandırma hazır, çağrı henüz yok
    return {
      ok: false,
      status: "failed",
      error: "PayTR entegrasyonu henüz bağlanmadı — lütfen test modunu kullanın",
    };
  }

  async refund() {
    return { ok: false, error: "PayTR iade entegrasyonu henüz bağlanmadı" };
  }
}
