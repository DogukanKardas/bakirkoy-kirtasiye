import { permanentRedirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

/** Eski ürün rotası — kalıcı olarak /urun/[slug]'a taşındı. */
export default async function LegacyProductPage({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/urun/${slug}`);
}
