import { randomUUID } from "node:crypto";
import { createAuditLog, getAuditLogs } from "@/lib/admin-data";

export type ColorSwatch = {
  id: string;
  name: string;
  hex: string | null;
  imageUrl: string | null;
  isEnabled: boolean;
  updatedAt: string | null;
};

const seedColorSwatches: ColorSwatch[] = [
  { id: "beige", name: "Beige", hex: "#d8c1a1", imageUrl: null, isEnabled: true, updatedAt: null },
  { id: "ivory", name: "Ivory", hex: "#f5f1e8", imageUrl: null, isEnabled: true, updatedAt: null },
  { id: "oat", name: "Oat", hex: "#d9ceb7", imageUrl: null, isEnabled: true, updatedAt: null },
  { id: "sand", name: "Sand", hex: "#cfb48d", imageUrl: null, isEnabled: true, updatedAt: null },
  { id: "terracotta", name: "Terracotta", hex: "#c8755c", imageUrl: null, isEnabled: true, updatedAt: null },
  { id: "sage", name: "Sage", hex: "#9cac92", imageUrl: null, isEnabled: true, updatedAt: null },
  { id: "dusty-rose", name: "Dusty Rose", hex: "#c99c9c", imageUrl: null, isEnabled: true, updatedAt: null },
  { id: "charcoal", name: "Charcoal", hex: "#5b5652", imageUrl: null, isEnabled: true, updatedAt: null },
];

function normalizeColorSwatches(payload: unknown): ColorSwatch[] {
  if (!Array.isArray(payload)) return seedColorSwatches;

  const mapped = payload
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const value = entry as Record<string, unknown>;
      if (typeof value.id !== "string" || typeof value.name !== "string") return null;

      const imageUrl = typeof value.imageUrl === "string" && value.imageUrl.trim() ? value.imageUrl.trim() : null;
      const hex = typeof value.hex === "string" && value.hex.trim() ? value.hex.trim() : null;

      return {
        id: value.id,
        name: value.name.trim(),
        hex,
        imageUrl,
        isEnabled: value.isEnabled !== false,
        updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
      } satisfies ColorSwatch;
    })
    .filter((entry): entry is ColorSwatch => Boolean(entry));

  return mapped.length ? mapped : seedColorSwatches;
}

async function persistColorSwatches(swatches: ColorSwatch[], actorUserId?: string | null) {
  await createAuditLog({
    actorUserId: actorUserId ?? null,
    entityType: "customization_options",
    entityId: "color_swatches",
    action: "swatches:update",
    payload: { swatches },
  });
}

export async function getColorSwatches() {
  const logs = await getAuditLogs("customization_options", "color_swatches");
  const latest = logs.find((entry) => entry.action === "swatches:update");
  return normalizeColorSwatches(latest?.payload?.swatches);
}

export async function getEnabledColorSwatches() {
  const swatches = await getColorSwatches();
  return swatches.filter((swatch) => swatch.isEnabled);
}

export async function createColorSwatch(
  input: { name: string; hex?: string | null; imageUrl?: string | null; isEnabled: boolean },
  actorUserId?: string | null,
) {
  const swatches = await getColorSwatches();
  const next: ColorSwatch[] = [
    {
      id: randomUUID(),
      name: input.name.trim(),
      hex: input.hex?.trim() || null,
      imageUrl: input.imageUrl?.trim() || null,
      isEnabled: input.isEnabled,
      updatedAt: new Date().toISOString(),
    },
    ...swatches,
  ];
  await persistColorSwatches(next, actorUserId);
}

export async function updateColorSwatch(
  id: string,
  input: { name: string; hex?: string | null; imageUrl?: string | null; isEnabled: boolean },
  actorUserId?: string | null,
) {
  const swatches = await getColorSwatches();
  const next = swatches.map((swatch) =>
    swatch.id === id
      ? {
          ...swatch,
          name: input.name.trim(),
          hex: input.hex?.trim() || null,
          imageUrl: input.imageUrl?.trim() || null,
          isEnabled: input.isEnabled,
          updatedAt: new Date().toISOString(),
        }
      : swatch,
  );
  await persistColorSwatches(next, actorUserId);
}

export async function deleteColorSwatch(id: string, actorUserId?: string | null) {
  const swatches = await getColorSwatches();
  const next = swatches.filter((swatch) => swatch.id !== id);
  await persistColorSwatches(next, actorUserId);
}
