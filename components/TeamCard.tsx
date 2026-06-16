import type { TeamMember } from "@/lib/dictionary-types";

export default function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="border border-line-300 bg-paper-50 p-7">
      <div className="flex h-16 w-16 items-center justify-center border border-line-400 bg-paper-200 font-heading text-lg text-graphite-800">
        {member.initials}
      </div>
      <h3 className="mt-5 font-heading text-lg text-ink">{member.name}</h3>
      <p className="mt-1 text-sm text-bronze-600">{member.role}</p>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">{member.bio}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {member.tags.map((tag) => (
          <span key={tag} className="border border-line-300 px-2.5 py-1 text-xs text-stone-600">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
