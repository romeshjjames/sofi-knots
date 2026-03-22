import { createAuditLog, getAuditLogs } from "@/lib/admin-data";
import type { CustomOrderDetail, CustomOrderStatus } from "@/types/custom-orders";

const seedCustomOrders: CustomOrderDetail[] = [
  {
    id: "co-bridal-clutch-1",
    customerName: "Rhea Menon",
    email: "rhea.menon@outlook.com",
    phone: "+91 99870 22341",
    productType: "Bridal macrame clutch",
    requestSummary: "Ivory bridal clutch with pearl detailing and soft gold hardware for a wedding gifting set.",
    budget: "Rs. 18,000 - 22,000",
    status: "quoted",
    submittedAt: "2026-03-21",
    estimatedPrice: "Rs. 19,500",
    assignedTeamMember: "Sofi Knots Studio",
    expectedCompletionDate: "2026-04-10",
    updatedAt: "2026-03-21T11:30:00.000Z",
    customizationDetails: "Pearl detailing on the flap, matching lining, and personalized initials on the inside pocket.",
    preferredColors: "Ivory, pearl white, soft gold",
    preferredMaterials: "Cotton macrame cord, satin lining, pearl embellishments",
    quantity: 3,
    referenceNotes: "Customer wants a premium bridal look that still feels handcrafted and soft.",
    referenceImages: ["Palette board", "Initial embroidery sketch", "Clutch silhouette"],
    timelineNotes: "Need final swatch approval before production starts.",
    internalNotes: "Feasible design. Premium embellishment sourcing still pending final approval.",
    productionTimeline: "3 to 4 weeks after swatch signoff",
    shippingEstimate: "Express shipping included to Kochi",
    specialConditions: "Initials must be subtle and inside the flap pocket.",
    confirmedPrice: "",
    paymentStatus: "Awaiting confirmation",
    trackingDetails: "",
    completionNotes: "",
    dispatchNotes: "",
    finalPaymentNotes: "",
    cancellationReason: "",
  },
  {
    id: "co-travel-tote-1",
    customerName: "Megha Sethi",
    email: "megha.sethi@gmail.com",
    phone: "+91 98110 44220",
    productType: "Custom travel tote",
    requestSummary: "Large travel-friendly tote with zip pocket, earthy tones, and reinforced straps.",
    budget: "Rs. 9,000 - 12,500",
    status: "new",
    submittedAt: "2026-03-20",
    estimatedPrice: "",
    assignedTeamMember: "",
    expectedCompletionDate: null,
    updatedAt: "2026-03-20T09:10:00.000Z",
    customizationDetails: "Hidden zip pocket, phone sleeve, and longer drop handle for airport use.",
    preferredColors: "Clay, rust, oat",
    preferredMaterials: "Cotton cord with structured canvas lining",
    quantity: 1,
    referenceNotes: "Customer shared Pinterest references for an understated luxury tote.",
    referenceImages: ["Pinterest tote inspiration"],
    timelineNotes: "Needs first response within 24 hours.",
    internalNotes: "Review bag size and lining reinforcement feasibility.",
    productionTimeline: "",
    shippingEstimate: "",
    specialConditions: "",
    confirmedPrice: "",
    paymentStatus: "",
    trackingDetails: "",
    completionNotes: "",
    dispatchNotes: "",
    finalPaymentNotes: "",
    cancellationReason: "",
  },
  {
    id: "co-wall-installation-1",
    customerName: "Sara Thomas",
    email: "sara.thomas@gmail.com",
    phone: "+91 98732 19484",
    productType: "Boutique cafe wall installation",
    requestSummary: "Statement wall hanging installation for a boutique cafe opening in Goa.",
    budget: "Rs. 35,000+",
    status: "in_progress",
    submittedAt: "2026-03-15",
    estimatedPrice: "Rs. 38,500",
    assignedTeamMember: "Studio Production Team",
    expectedCompletionDate: "2026-04-18",
    updatedAt: "2026-03-18T16:20:00.000Z",
    customizationDetails: "Large-scale woven centerpiece with layered fringe and custom width for the cafe wall.",
    preferredColors: "Sand, terracotta, muted sage",
    preferredMaterials: "Premium cotton rope, wooden mounting rod",
    quantity: 1,
    referenceNotes: "Needs to complement the cafe's earthy palette and natural materials.",
    referenceImages: ["Cafe wall photo", "Palette selection"],
    timelineNotes: "Sampling approved. Production underway.",
    internalNotes: "Material ordering complete. Installation logistics to be confirmed.",
    productionTimeline: "4 weeks production plus installation coordination",
    shippingEstimate: "Goa freight plus installation visit",
    specialConditions: "Must install before cafe opening date.",
    confirmedPrice: "Rs. 38,500",
    paymentStatus: "Advance received",
    trackingDetails: "",
    completionNotes: "",
    dispatchNotes: "",
    finalPaymentNotes: "",
    cancellationReason: "",
  },
];

function normalizeCustomOrders(payload: unknown): CustomOrderDetail[] {
  if (!Array.isArray(payload)) return seedCustomOrders;

  return payload
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const value = entry as Record<string, unknown>;
      if (
        typeof value.id !== "string" ||
        typeof value.customerName !== "string" ||
        typeof value.email !== "string" ||
        typeof value.productType !== "string"
      ) {
        return null;
      }

      const status: CustomOrderStatus =
        value.status === "under_review" ||
        value.status === "contacted" ||
        value.status === "awaiting_customer_response" ||
        value.status === "quoted" ||
        value.status === "awaiting_approval" ||
        value.status === "approved" ||
        value.status === "in_progress" ||
        value.status === "completed" ||
        value.status === "delivered" ||
        value.status === "rejected" ||
        value.status === "cancelled"
          ? value.status
          : "new";

      return {
        id: value.id,
        customerName: value.customerName,
        email: value.email,
        phone: typeof value.phone === "string" ? value.phone : "",
        productType: value.productType,
        requestSummary: typeof value.requestSummary === "string" ? value.requestSummary : "",
        budget: typeof value.budget === "string" ? value.budget : "",
        status,
        submittedAt: typeof value.submittedAt === "string" ? value.submittedAt : new Date().toISOString().slice(0, 10),
        estimatedPrice: typeof value.estimatedPrice === "string" ? value.estimatedPrice : "",
        assignedTeamMember: typeof value.assignedTeamMember === "string" ? value.assignedTeamMember : "",
        expectedCompletionDate: typeof value.expectedCompletionDate === "string" ? value.expectedCompletionDate : null,
        updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
        customizationDetails: typeof value.customizationDetails === "string" ? value.customizationDetails : "",
        preferredColors: typeof value.preferredColors === "string" ? value.preferredColors : "",
        preferredMaterials: typeof value.preferredMaterials === "string" ? value.preferredMaterials : "",
        quantity: typeof value.quantity === "number" ? value.quantity : null,
        referenceNotes: typeof value.referenceNotes === "string" ? value.referenceNotes : "",
        referenceImages: Array.isArray(value.referenceImages) ? value.referenceImages.filter((item): item is string => typeof item === "string") : [],
        timelineNotes: typeof value.timelineNotes === "string" ? value.timelineNotes : "",
        internalNotes: typeof value.internalNotes === "string" ? value.internalNotes : "",
        productionTimeline: typeof value.productionTimeline === "string" ? value.productionTimeline : "",
        shippingEstimate: typeof value.shippingEstimate === "string" ? value.shippingEstimate : "",
        specialConditions: typeof value.specialConditions === "string" ? value.specialConditions : "",
        confirmedPrice: typeof value.confirmedPrice === "string" ? value.confirmedPrice : "",
        paymentStatus: typeof value.paymentStatus === "string" ? value.paymentStatus : "",
        trackingDetails: typeof value.trackingDetails === "string" ? value.trackingDetails : "",
        completionNotes: typeof value.completionNotes === "string" ? value.completionNotes : "",
        dispatchNotes: typeof value.dispatchNotes === "string" ? value.dispatchNotes : "",
        finalPaymentNotes: typeof value.finalPaymentNotes === "string" ? value.finalPaymentNotes : "",
        cancellationReason: typeof value.cancellationReason === "string" ? value.cancellationReason : "",
      } satisfies CustomOrderDetail;
    })
    .filter((entry): entry is CustomOrderDetail => Boolean(entry));
}

async function persistCustomOrders(customOrders: CustomOrderDetail[], actorUserId?: string | null) {
  await createAuditLog({
    actorUserId: actorUserId ?? null,
    entityType: "custom_order_admin",
    entityId: "library",
    action: "custom_orders:update",
    payload: { customOrders },
  });
}

export async function getCustomOrders(): Promise<CustomOrderDetail[]> {
  const logs = await getAuditLogs("custom_order_admin", "library");
  const latest = logs.find((entry) => entry.action === "custom_orders:update");
  return normalizeCustomOrders(latest?.payload?.customOrders);
}

export async function getCustomOrderById(id: string): Promise<CustomOrderDetail | null> {
  const customOrders = await getCustomOrders();
  return customOrders.find((item) => item.id === id) ?? null;
}

export async function createCustomOrder(input: CustomOrderDetail, actorUserId?: string | null) {
  const customOrders = await getCustomOrders();
  const next = [{ ...input, updatedAt: new Date().toISOString() }, ...customOrders];
  await persistCustomOrders(next, actorUserId);
}

export async function updateCustomOrder(id: string, input: CustomOrderDetail, actorUserId?: string | null) {
  const customOrders = await getCustomOrders();
  const next = customOrders.map((item) => (item.id === id ? { ...input, id, updatedAt: new Date().toISOString() } : item));
  await persistCustomOrders(next, actorUserId);
}

export async function deleteCustomOrder(id: string, actorUserId?: string | null) {
  const customOrders = await getCustomOrders();
  const next = customOrders.filter((item) => item.id !== id);
  await persistCustomOrders(next, actorUserId);
}
