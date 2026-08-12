import Image from "next/image";
import type { TeamMember } from "@/lib/dictionary-types";

export default function TeamCard({
  member,
}: {
  member: TeamMember;
}) {
  return (
    <div className="group flex h-full flex-col cursor-default">
      <div className="relative aspect-[4/5] overflow-hidden bg-paper-200">
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-paper-200">
            <span className="font-heading text-4xl text-graphite-400">{member.initials}</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-heading text-sm text-ink">{member.name}</h3>
        <p className="mt-0.5 text-xs text-bronze-600">{member.role}</p>
        {member.bio && (
          <p className="mt-2 text-xs leading-relaxed text-stone-500 line-clamp-3">{member.bio}</p>
        )}
      </div>
    </div>
  );
}
