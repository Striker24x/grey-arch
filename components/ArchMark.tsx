import Image from "next/image";

export default function ArchMark({ className }: { className?: string }) {
  return (
    <Image
      src="/images/grey-arch/branding/logo-mark.png"
      alt="GrayArc"
      width={240}
      height={216}
      priority
      className={`${className ?? ""} object-contain dark:invert`}
    />
  );
}
