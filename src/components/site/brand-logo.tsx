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
  const width = Math.round(height * 3);

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={`h-auto w-auto object-contain ${className}`}
      style={{ height, width: "auto" }}
    />
  );
}
