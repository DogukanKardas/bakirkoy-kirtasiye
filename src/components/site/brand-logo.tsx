import Image from "next/image";

type BrandLogoProps = {
  src: string;
  alt: string;
  height?: number;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  src,
  alt,
  height = 40,
  className = "",
  priority = false,
}: BrandLogoProps) {
  // Logo ~3:1 (1024×341); dar header'da ezilmesin diye shrink-0
  const width = Math.round(height * 3);

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={`block h-auto w-auto shrink-0 object-contain object-left ${className}`}
      style={{ height, width: "auto", maxHeight: height }}
    />
  );
}
