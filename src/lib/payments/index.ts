import { FakePaymentProvider } from "./fake";
import { IyzicoPaymentProvider } from "./iyzico";
import { PaytrPaymentProvider } from "./paytr";
import type { PaymentProvider } from "./types";

export type { PaymentCard, PaymentProvider, PaymentRequest, PaymentResult } from "./types";

let cached: PaymentProvider | null = null;

/**
 * Aktif ödeme sağlayıcısını döner.
 *
 * `PAYMENT_PROVIDER` ortam değişkeni: "test" (varsayılan) | "iyzico" | "paytr"
 * iyzico/paytr seçili ama anahtarlar eksikse güvenli biçimde test
 * sağlayıcısına düşer — canlı anahtar olmadan gerçek tahsilat ASLA yapılmaz.
 */
export function getPaymentProvider(): PaymentProvider {
  if (cached) return cached;

  const key = (process.env.PAYMENT_PROVIDER ?? "test").toLowerCase();
  switch (key) {
    case "iyzico":
      try {
        cached = new IyzicoPaymentProvider({
          apiKey: process.env.IYZICO_API_KEY ?? "",
          secretKey: process.env.IYZICO_SECRET_KEY ?? "",
          baseUrl: process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com",
        });
        return cached;
      } catch {
        /* anahtarlar eksik → test moduna düş */
      }
      break;
    case "paytr":
      try {
        cached = new PaytrPaymentProvider({
          merchantId: process.env.PAYTR_MERCHANT_ID ?? "",
          merchantKey: process.env.PAYTR_MERCHANT_KEY ?? "",
          merchantSalt: process.env.PAYTR_MERCHANT_SALT ?? "",
          testMode: process.env.PAYTR_TEST_MODE ?? "1",
        });
        return cached;
      } catch {
        /* anahtarlar eksik → test moduna düş */
      }
      break;
  }

  cached = new FakePaymentProvider();
  return cached;
}
