import { ImageResponse } from "next/og";
import { getProductBySlugCached, getSettings } from "@db/queries";
import { formatPrice } from "@/lib/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Ürün görseli";

type Props = { params: Promise<{ slug: string }> };

/** Ürün paylaşımları için dinamik OG kartı: görsel + ad + fiyat. */
export default async function OgImage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlugCached(slug),
    getSettings(),
  ]);

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f3efe6",
            color: "#151515",
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          {settings.shopName}
        </div>
      ),
      size,
    );
  }

  const cover = product.images[0]?.url ?? product.imageUrl ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f3efe6",
          color: "#151515",
        }}
      >
        {/* sol: ürün görseli */}
        <div
          style={{
            width: 630,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#eae4d6",
            borderRight: "2px solid #d8d2c0",
          }}
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div style={{ fontSize: 120, opacity: 0.15 }}>✎</div>
          )}
        </div>

        {/* sağ: metin */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#6f6a58",
            }}
          >
            {settings.shopName}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <div
              style={{
                fontSize: product.name.length > 40 ? 52 : 64,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: -1,
              }}
            >
              {product.name}
            </div>
            {settings.showPrices ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 34,
                    fontFamily: "monospace",
                    border: "2px solid #151515",
                    padding: "6px 18px",
                    background: "#f2e14c",
                  }}
                >
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : null}
          </div>

          <div style={{ fontSize: 20, color: "#6f6a58" }}>
            {settings.district} / {settings.city}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
