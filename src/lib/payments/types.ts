/**
 * Ödeme sağlayıcı soyutlaması.
 *
 * Tüm sağlayıcılar (test, iyzico, PayTR…) bu arayüzü uygular. Checkout
 * akışı yalnızca `getPaymentProvider()` üzerinden konuşur; sağlayıcı
 * değişimi ortam değişkeniyle yapılır, kod değişmez.
 *
 * Tutarlar her zaman kuruş (integer) cinsindendir.
 */

export type PaymentCard = {
  holder: string;
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
};

export type PaymentCustomer = {
  name: string;
  email: string;
  phone: string;
};

export type PaymentRequest = {
  orderId: string;
  orderNumber: string;
  /** Kuruş cinsinden toplam tutar */
  amount: number;
  currency: "TRY";
  customer: PaymentCustomer;
  /** Kartlı ödeme denemelerinde dolu gelir */
  card?: PaymentCard;
  /** Sağlayıcı sayfasına yönlendirme gereken akışlarda dönüş adresi */
  callbackUrl?: string;
};

export type PaymentResult =
  | {
      ok: true;
      status: "paid";
      transactionId: string;
      /** 3D Secure / sağlayıcı sayfası gibi yönlendirme gereken akışlar için */
      redirectUrl?: string;
    }
  | {
      ok: false;
      status: "failed";
      error: string;
      transactionId?: string;
    };

export interface PaymentProvider {
  /** Makine anahtarı: "test" | "iyzico" | "paytr" */
  readonly key: string;
  /** Yöneticiye gösterilen ad */
  readonly label: string;
  /** true iken gerçek para hareketi olmaz */
  readonly testMode: boolean;
  createPayment(req: PaymentRequest): Promise<PaymentResult>;
  /** İsteğe bağlı iade; iskelet adaptörler henüz uygulamaz */
  refund?(transactionId: string, amount: number): Promise<{ ok: boolean; error?: string }>;
}
