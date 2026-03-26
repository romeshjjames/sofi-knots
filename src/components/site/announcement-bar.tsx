import Link from "next/link";
import type { AnnouncementBarRecord } from "@/lib/announcement-bar";

export function AnnouncementBar({ announcement }: { announcement: AnnouncementBarRecord | null }) {
  if (!announcement) return null;

  return (
    <div className="border-b border-[#2b3641] bg-[#1f2933] text-white">
      <div className="brand-container flex min-h-11 items-center justify-center gap-3 px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.14em] sm:text-sm">
        <span>{announcement.text}</span>
        {announcement.ctaLink ? (
          <Link href={announcement.ctaLink} className="text-[#e8c38f] transition hover:text-white">
            Learn more
          </Link>
        ) : null}
      </div>
    </div>
  );
}
