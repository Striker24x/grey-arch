import Image from "next/image";

// Hosts allow-listed in next.config.ts images.remotePatterns. Anything else (e.g. an
// external URL an admin pasted into the rich-text editor) is rendered as a plain <img>
// so it never trips next/image's "hostname is not configured" runtime error.
const OPTIMIZABLE_HOSTS = [
  /^https:\/\/pub-564792c364284f1480aa91cf5b945431\.r2\.dev\//,
  /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//,
  /^https:\/\/res\.cloudinary\.com\//,
  /^https:\/\/grey-arch-media\.b-cdn\.net\//,
  /^https:\/\/vz-bed925c5-d3e\.b-cdn\.net\//,
];

export function canOptimize(src: string): boolean {
  return (src.startsWith("/") && !src.startsWith("//")) || OPTIMIZABLE_HOSTS.some((re) => re.test(src));
}

/** Fill-mode image (parent must be `relative` with a size/aspect). */
export default function GaImage({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (canOptimize(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  );
}
