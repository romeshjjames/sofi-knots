import { createAuditLog, getAuditLogs } from "@/lib/admin-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { DiscountDetail, DiscountStatus, DiscountSummary, DiscountType } from "@/types/discounts";

const seedDiscounts: DiscountDetail[] = [
  {
    id: "disc-newknots10",
    code: "NEWKNOTS10",
    title: "New customer welcome offer",
    automaticName: "New customer welcome offer",
    type: "percentage",
    value: "10%",
    minimumOrderAmountInr: 4500,
    usageLimit: 300,
    usageCount: 122,
    oneUsePerCustomer: true,
    combinable: false,
    startsAt: "2026-03-01T00:00:00.000Z",
    endsAt: "2026-04-30T23:59:00.000Z",
    status: "active",
    eligibility: "all_products",
    customerEligibility: "all_customers",
    eligibleProducts: [],
    eligibleCollections: [],
    eligibleCustomers: [],
    eligibleCustomerTags: [],
    appliesTo: "All products",
    revenueImpactInr: 32400,
    orderCount: 122,
    updatedAt: "2026-03-18T12:00:00.000Z",
  },
  {
    id: "disc-premium750",
    code: "PREMIUM750",
    title: "Premium collection incentive",
    automaticName: "Premium collection incentive",
    type: "fixed",
    value: "Rs. 750",
    minimumOrderAmountInr: 8000,
    usageLimit: 75,
    usageCount: 43,
    oneUsePerCustomer: false,
    combinable: false,
    startsAt: "2026-03-10T00:00:00.000Z",
    endsAt: "2026-05-15T23:59:00.000Z",
    status: "active",
    eligibility: "specific_collections",
    customerEligibility: "specific_tags",
    eligibleProducts: [],
    eligibleCollections: ["premium-collection"],
    eligibleCustomers: [],
    eligibleCustomerTags: ["VIP", "Premium buyer"],
    appliesTo: "Premium Collection",
    revenueImpactInr: 22500,
    orderCount: 43,
    updatedAt: "2026-03-17T10:30:00.000Z",
  },
  {
    id: "disc-freeship-weekend",
    code: "FREESHIPWEEKEND",
    title: "Weekend free shipping",
    automaticName: "Weekend free shipping",
    type: "free_shipping",
    value: "Free shipping",
    minimumOrderAmountInr: 2500,
    usageLimit: null,
    usageCount: 0,
    oneUsePerCustomer: false,
    combinable: true,
    startsAt: "2026-03-28T00:00:00.000Z",
    endsAt: "2026-03-29T23:59:00.000Z",
    status: "scheduled",
    eligibility: "all_products",
    customerEligibility: "all_customers",
    eligibleProducts: [],
    eligibleCollections: [],
    eligibleCustomers: [],
    eligibleCustomerTags: [],
    appliesTo: "Online store",
    revenueImpactInr: 0,
    orderCount: 0,
    updatedAt: "2026-03-20T16:15:00.000Z",
  },
];

function normalizeDiscounts(payload: unknown): DiscountDetail[] {
  if (!Array.isArray(payload)) return seedDiscounts;
  return payload
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const value = entry as Record<string, unknown>;
      if (typeof value.id !== "string" || typeof value.code !== "string") return null;
      return {
        id: value.id,
        code: value.code,
        title: typeof value.title === "string" ? value.title : value.code,
        automaticName: typeof value.automaticName === "string" ? value.automaticName : value.code,
        type:
          value.type === "fixed" || value.type === "free_shipping" || value.type === "buy_x_get_y"
            ? value.type
            : "percentage",
        value: typeof value.value === "string" ? value.value : "",
        minimumOrderAmountInr: typeof value.minimumOrderAmountInr === "number" ? value.minimumOrderAmountInr : null,
        usageLimit: typeof value.usageLimit === "number" ? value.usageLimit : null,
        usageCount: typeof value.usageCount === "number" ? value.usageCount : 0,
        oneUsePerCustomer: value.oneUsePerCustomer === true,
        combinable: value.combinable === true,
        startsAt: typeof value.startsAt === "string" ? value.startsAt : null,
        endsAt: typeof value.endsAt === "string" ? value.endsAt : null,
        status:
          value.status === "active" || value.status === "scheduled" || value.status === "expired"
            ? value.status
            : "draft",
        eligibility:
          value.eligibility === "specific_products" || value.eligibility === "specific_collections"
            ? value.eligibility
            : "all_products",
        customerEligibility:
          value.customerEligibility === "specific_tags" || value.customerEligibility === "specific_customers"
            ? value.customerEligibility
            : "all_customers",
        eligibleProducts: Array.isArray(value.eligibleProducts) ? value.eligibleProducts.filter((item): item is string => typeof item === "string") : [],
        eligibleCollections: Array.isArray(value.eligibleCollections) ? value.eligibleCollections.filter((item): item is string => typeof item === "string") : [],
        eligibleCustomers: Array.isArray(value.eligibleCustomers) ? value.eligibleCustomers.filter((item): item is string => typeof item === "string") : [],
        eligibleCustomerTags: Array.isArray(value.eligibleCustomerTags) ? value.eligibleCustomerTags.filter((item): item is string => typeof item === "string") : [],
        appliesTo: typeof value.appliesTo === "string" ? value.appliesTo : "All products",
        revenueImpactInr: typeof value.revenueImpactInr === "number" ? value.revenueImpactInr : 0,
        orderCount: typeof value.orderCount === "number" ? value.orderCount : 0,
        updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
      } satisfies DiscountDetail;
    })
    .filter((entry): entry is DiscountDetail => Boolean(entry));
}

async function persistDiscounts(discounts: DiscountDetail[], actorUserId?: string | null) {
  await createAuditLog({
    actorUserId: actorUserId ?? null,
    entityType: "discount_admin",
    entityId: "library",
    action: "discounts:update",
    payload: { discounts },
  });
}

export async function getDiscounts(): Promise<DiscountDetail[]> {
  const logs = await getAuditLogs("discount_admin", "library");
  const latest = logs.find((entry) => entry.action === "discounts:update");
  const discounts = normalizeDiscounts(latest?.payload?.discounts);
  return discounts.map((discount) => ({
    ...discount,
  }));
}

export async function getDiscountById(id: string): Promise<DiscountDetail | null> {
  const discounts = await getDiscounts();
  return discounts.find((discount) => discount.id === id) ?? null;
}

export async function getDiscountSupportData() {
  const supabase = createAdminSupabaseClient();
  const [{ data: products }, { data: collections }, { data: customers }] = await Promise.all([
    supabase.from("products").select("id, name").order("name", { ascending: true }),
    supabase.from("collections").select("id, name, slug").order("name", { ascending: true }),
    supabase.from("customers").select("id, full_name, email").order("full_name", { ascending: true }),
  ]);

  return {
    products: (products ?? []).map((item) => ({ id: item.id, label: item.name })),
    collections: (collections ?? []).map((item) => ({ id: item.id, label: item.name || item.slug })),
    customers: (customers ?? []).map((item) => ({ id: item.id, label: item.full_name || item.email || item.id })),
  };
}

export async function createDiscount(input: DiscountDetail, actorUserId?: string | null) {
  const discounts = await getDiscounts();
  const next = [{ ...input, updatedAt: new Date().toISOString() }, ...discounts];
  await persistDiscounts(next, actorUserId);
}

export async function updateDiscount(id: string, input: DiscountDetail, actorUserId?: string | null) {
  const discounts = await getDiscounts();
  const next = discounts.map((discount) => (discount.id === id ? { ...input, id, updatedAt: new Date().toISOString() } : discount));
  await persistDiscounts(next, actorUserId);
}

export async function deleteDiscount(id: string, actorUserId?: string | null) {
  const discounts = await getDiscounts();
  const next = discounts.filter((discount) => discount.id !== id);
  await persistDiscounts(next, actorUserId);
}

export function deriveDiscountStatus(input: { startsAt: string | null; endsAt: string | null; status: DiscountStatus }): DiscountStatus {
  if (input.status === "draft") return "draft";
  const now = Date.now();
  const startsAt = input.startsAt ? new Date(input.startsAt).getTime() : null;
  const endsAt = input.endsAt ? new Date(input.endsAt).getTime() : null;
  if (startsAt && startsAt > now) return "scheduled";
  if (endsAt && endsAt < now) return "expired";
  return "active";
}

export function buildDiscountValueLabel(type: DiscountType, rawValue: string) {
  if (type === "percentage") return `${rawValue}%`;
  if (type === "fixed") return `Rs. ${rawValue}`;
  if (type === "free_shipping") return "Free shipping";
  return rawValue;
}
