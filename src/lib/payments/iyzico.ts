import type { PaymentProvider, PaymentRequest, PaymentResult } from "./types";

export type IyzicoConfig = {
  apiKey: string;
  secretKey: string;
  /** https://sandbox-api.iyzipay.com veya https://api.iyzipay.com */
  baseUrl: string;
};

/**
 * iyzico adaptörü — İSKELET.
 *
 * Canlı anahtarlar bilinçli olarak BAĞLANMADI: `createPayment` şimdilik
 * her zaman "entegrasyon bekleniyor" hatası döner. Gerçek entegrasyonda:
 *
 *  1. `iyzipay` npm paketi kurulur (veya REST API doğrudan çağrılır).
 *  2. 3D Secure akışı için `callbackUrl`'e dönüş doğrulaması yapılır:
 *     POST /api/payments/iyzico/callback → ödeme durumu sorgulanır →
 *     admin_mark_order_paid / admin_mark_order_failed RPC'leri çağrılır.
 *  3. Kart verisi sunucuda saklanmaz; iyzico checkout form / API'ye
 *     doğrudan iletilir (PCI-DSS kapsamı dar tutulur).
 *  4. Webhook imza doğrulaması yapılır.
 */
export class IyzicoPaymentProvider implements PaymentProvider {
  readonly key = "iyzico";
  readonly label = "iyzico";
  readonly testMode = false;

  constructor(private readonly config: IyzicoConfig) {
    if (!config.apiKey || !config.secretKey || !config.baseUrl) {
      throw new Error("iyzico yapılandırması eksik (IYZICO_API_KEY / IYZICO_SECRET_KEY / IYZICO_BASE_URL)");
    }
  }

  async createPayment(_req: PaymentRequest): Promise<PaymentResult> {
    void this.config; // iskelet: yapılandırma hazır, çağrı henüz yok
    return {
      ok: false,
      status: "failed",
      error: "iyzico entegrasyonu henüz bağlanmadı — lütfen test modunu kullanın",
    };
  }

  async refund() {
    return { ok: false, error: "iyzico iade entegrasyonu henüz bağlanmadı" };
  }
}
