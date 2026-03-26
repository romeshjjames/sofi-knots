import { unstable_noStore as noStore } from "next/cache";
import { createAuditLog, getAuditLogs } from "@/lib/admin-data";

export type AnnouncementBarRecord = {
  text: string;
  ctaLink: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  updatedAt: string | null;
};

function normalizeAnnouncementBar(payload: Record<string, unknown> | null | undefined, createdAt: string | null): AnnouncementBarRecord {
  return {
    text: typeof payload?.text === "string" ? payload.text : "",
    ctaLink: typeof payload?.ctaLink === "string" && payload.ctaLink ? payload.ctaLink : null,
    isActive: payload?.isActive === true,
    startsAt: typeof payload?.startsAt === "string" && payload.startsAt ? payload.startsAt : null,
    endsAt: typeof payload?.endsAt === "string" && payload.endsAt ? payload.endsAt : null,
    updatedAt: createdAt,
  };
}

function normalizeScheduleValue(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function isWithinSchedule(record: AnnouncementBarRecord) {
  const now = Date.now();
  const start = record.startsAt ? new Date(record.startsAt).getTime() : null;
  const end = record.endsAt ? new Date(record.endsAt).getTime() : null;

  if (start && Number.isFinite(start) && now < start) return false;
  if (end && Number.isFinite(end) && now > end) return false;
  return true;
}

export async function getAnnouncementBar(): Promise<AnnouncementBarRecord> {
  const logs = await getAuditLogs("announcement_bar", "global");
  const latest = logs.find((log) => log.action === "settings:update");
  return normalizeAnnouncementBar((latest?.payload ?? {}) as Record<string, unknown>, latest?.createdAt ?? null);
}

export async function getActiveAnnouncementBar(): Promise<AnnouncementBarRecord | null> {
  noStore();
  const record = await getAnnouncementBar();
  if (!record.isActive || !record.text.trim() || !isWithinSchedule(record)) {
    return null;
  }
  return record;
}

export async function updateAnnouncementBar(
  input: {
    text: string;
    ctaLink?: string | null;
    isActive: boolean;
    startsAt?: string | null;
    endsAt?: string | null;
  },
  actorUserId?: string | null,
) {
  await createAuditLog({
    actorUserId: actorUserId ?? null,
    entityType: "announcement_bar",
    entityId: "global",
    action: "settings:update",
    payload: {
      text: input.text,
      ctaLink: input.ctaLink || null,
      isActive: input.isActive,
      startsAt: normalizeScheduleValue(input.startsAt),
      endsAt: normalizeScheduleValue(input.endsAt),
    },
  });
}
