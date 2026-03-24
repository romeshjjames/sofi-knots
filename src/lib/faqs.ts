import { randomUUID } from "node:crypto";
import { unstable_noStore as noStore } from "next/cache";
import { createAuditLog, getAuditLogs } from "@/lib/admin-data";
import type { FaqRecord } from "@/types/faqs";

const seedFaqs: FaqRecord[] = [
  {
    id: "faq-handmade",
    question: "Are all Sofi Knots products handmade?",
    answer: "Yes. Every Sofi Knots piece is handcrafted with a focus on texture, quality, and premium finishing.",
    category: "General",
    displayOrder: 1,
    status: "active",
    updatedAt: "2026-03-24T00:00:00.000Z",
  },
  {
    id: "faq-custom-orders",
    question: "Do you accept custom orders?",
    answer: "Yes. You can submit a custom order request through the website and our team will review the design, materials, and pricing details with you.",
    category: "Custom Orders",
    displayOrder: 2,
    status: "active",
    updatedAt: "2026-03-24T00:00:00.000Z",
  },
  {
    id: "faq-shipping",
    question: "How long does shipping take?",
    answer: "Standard dispatch timelines depend on the item type and customization level, but most ready products ship within a few business days.",
    category: "Shipping",
    displayOrder: 3,
    status: "active",
    updatedAt: "2026-03-24T00:00:00.000Z",
  },
];

function normalizeFaqs(payload: unknown): FaqRecord[] {
  if (!Array.isArray(payload)) return seedFaqs;

  return payload
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const value = entry as Record<string, unknown>;
      if (typeof value.id !== "string" || typeof value.question !== "string" || typeof value.answer !== "string") {
        return null;
      }

      return {
        id: value.id,
        question: value.question,
        answer: value.answer,
        category: typeof value.category === "string" && value.category.trim() ? value.category : "General",
        displayOrder: typeof value.displayOrder === "number" ? value.displayOrder : 0,
        status: value.status === "inactive" ? "inactive" : "active",
        updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
      } satisfies FaqRecord;
    })
    .filter((entry): entry is FaqRecord => Boolean(entry))
    .sort((left, right) => left.displayOrder - right.displayOrder);
}

async function persistFaqs(faqs: FaqRecord[], actorUserId?: string | null) {
  await createAuditLog({
    actorUserId: actorUserId ?? null,
    entityType: "faq_admin",
    entityId: "library",
    action: "faqs:update",
    payload: { faqs },
  });
}

export async function getFaqs(): Promise<FaqRecord[]> {
  noStore();
  const logs = await getAuditLogs("faq_admin", "library");
  const latest = logs.find((entry) => entry.action === "faqs:update");
  return normalizeFaqs(latest?.payload?.faqs);
}

export async function getActiveFaqs(): Promise<FaqRecord[]> {
  const faqs = await getFaqs();
  return faqs.filter((item) => item.status === "active").sort((left, right) => left.displayOrder - right.displayOrder);
}

export async function getFaqById(id: string): Promise<FaqRecord | null> {
  const faqs = await getFaqs();
  return faqs.find((item) => item.id === id) ?? null;
}

export async function createFaq(input: Omit<FaqRecord, "id" | "updatedAt"> & { id?: string }, actorUserId?: string | null) {
  const faqs = await getFaqs();
  const next = [
    {
      ...input,
      id: input.id || `faq-${randomUUID()}`,
      updatedAt: new Date().toISOString(),
    },
    ...faqs,
  ].sort((left, right) => left.displayOrder - right.displayOrder);

  await persistFaqs(next, actorUserId);
}

export async function updateFaq(id: string, input: Omit<FaqRecord, "id" | "updatedAt">, actorUserId?: string | null) {
  const faqs = await getFaqs();
  const next = faqs
    .map((item) => (item.id === id ? { ...input, id, updatedAt: new Date().toISOString() } : item))
    .sort((left, right) => left.displayOrder - right.displayOrder);

  await persistFaqs(next, actorUserId);
}

export async function deleteFaq(id: string, actorUserId?: string | null) {
  const faqs = await getFaqs();
  const next = faqs.filter((item) => item.id !== id);
  await persistFaqs(next, actorUserId);
}
