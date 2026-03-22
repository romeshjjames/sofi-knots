import { createAuditLog, getAuditLogs } from "@/lib/admin-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type MediaAssetRecord = {
  id: string;
  fileName: string;
  path: string;
  publicUrl: string;
  altText: string | null;
  tags: string[];
  category: string | null;
  mediaType: "image" | "video" | "icon" | "banner" | "file";
  createdAt: string | null;
  deletedAt: string | null;
};

function normalizeMediaType(value: unknown): MediaAssetRecord["mediaType"] {
  if (value === "image" || value === "video" || value === "icon" || value === "banner") return value;
  return "file";
}

export async function getMediaAssets() {
  const logs = await getAuditLogs("media_library");
  const map = new Map<string, MediaAssetRecord>();

  for (const entry of logs.slice().reverse()) {
    const payload = (entry.payload ?? {}) as Record<string, unknown>;
    const id = typeof payload.id === "string" ? payload.id : entry.entityId;
    if (!id) continue;

    if (entry.action === "upload") {
      map.set(id, {
        id,
        fileName: typeof payload.fileName === "string" ? payload.fileName : "Untitled media",
        path: typeof payload.path === "string" ? payload.path : "",
        publicUrl: typeof payload.publicUrl === "string" ? payload.publicUrl : "",
        altText: typeof payload.altText === "string" && payload.altText.trim() ? payload.altText : null,
        tags: Array.isArray(payload.tags) ? payload.tags.filter((value): value is string => typeof value === "string") : [],
        category: typeof payload.category === "string" && payload.category.trim() ? payload.category : null,
        mediaType: normalizeMediaType(payload.mediaType),
        createdAt: entry.createdAt,
        deletedAt: null,
      });
    }

    if (entry.action === "delete" && map.has(id)) {
      const current = map.get(id);
      if (!current) continue;
      map.set(id, {
        ...current,
        deletedAt: entry.createdAt,
      });
    }
  }

  return Array.from(map.values())
    .filter((asset) => !asset.deletedAt)
    .sort((left, right) => {
      const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
      return rightTime - leftTime;
    });
}

export async function deleteMediaAsset(input: { id: string; path: string; actorUserId?: string | null }) {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.storage.from("product-media").remove([input.path]);
  if (error) throw new Error(error.message);

  await createAuditLog({
    actorUserId: input.actorUserId ?? null,
    entityType: "media_library",
    entityId: input.id,
    action: "delete",
    payload: { id: input.id, path: input.path },
  });
}
