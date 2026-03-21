import { createHmac } from "crypto";

type PreviewKind = "page" | "post";

function getPreviewSecret() {
  return process.env.PREVIEW_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sofi-knots-preview";
}

export function createPreviewToken(kind: PreviewKind, id: string) {
  return createHmac("sha256", getPreviewSecret()).update(`${kind}:${id}`).digest("hex").slice(0, 32);
}

export function verifyPreviewToken(kind: PreviewKind, id: string, token: string) {
  return token === createPreviewToken(kind, id);
}

export function getPreviewUrl(kind: PreviewKind, id: string) {
  const token = createPreviewToken(kind, id);
  return `/preview/${kind}/${id}?token=${token}`;
}
