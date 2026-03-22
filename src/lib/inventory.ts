import { createAuditLog, getProductAdminSettingsMap, type ProductAdminSettingsRecord, type ProductVariantRecord } from "@/lib/admin-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { InventoryAdjustmentReason, InventoryAdjustmentRecord, InventoryDetail, InventoryRecord, InventoryStatus } from "@/types/inventory";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  status: "draft" | "active" | "archived";
  categories: { name: string; slug: string }[] | null;
  collections: { name: string; slug: string }[] | null;
};

type InventorySettingsRecord = {
  productId: string;
  location: string;
  safetyStock: number;
  incomingStock: number;
  reservedStock: number;
  updatedAt: string | null;
};

function resolveInventoryStatus(input: {
  inventoryTracking: boolean;
  availableStock: number;
  safetyStock: number;
}) {
  if (!input.inventoryTracking) return "not_tracked" satisfies InventoryStatus;
  if (input.availableStock <= 0) return "out_of_stock" satisfies InventoryStatus;
  if (input.availableStock <= input.safetyStock) return "low_stock" satisfies InventoryStatus;
  return "in_stock" satisfies InventoryStatus;
}

async function getInventorySettingsMap(productIds: string[]) {
  const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));
  if (!uniqueIds.length) return {} as Record<string, InventorySettingsRecord>;

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("entity_id, payload, created_at")
    .eq("entity_type", "inventory_settings")
    .eq("action", "settings:update")
    .in("entity_id", uniqueIds)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const map: Record<string, InventorySettingsRecord> = {};
  for (const row of data ?? []) {
    if (map[row.entity_id]) continue;
    const payload = (row.payload ?? {}) as Record<string, unknown>;
    map[row.entity_id] = {
      productId: row.entity_id,
      location: typeof payload.location === "string" && payload.location ? payload.location : "Main studio",
      safetyStock: typeof payload.safetyStock === "number" ? payload.safetyStock : 3,
      incomingStock: typeof payload.incomingStock === "number" ? payload.incomingStock : 0,
      reservedStock: typeof payload.reservedStock === "number" ? payload.reservedStock : 0,
      updatedAt: row.created_at,
    };
  }

  uniqueIds.forEach((productId) => {
    if (map[productId]) return;
    map[productId] = {
      productId,
      location: "Main studio",
      safetyStock: 3,
      incomingStock: 0,
      reservedStock: 0,
      updatedAt: null,
    };
  });

  return map;
}

async function getInventoryAdjustments(productId: string): Promise<InventoryAdjustmentRecord[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, payload, created_at")
    .eq("entity_type", "inventory")
    .eq("entity_id", productId)
    .eq("action", "adjustment:create")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const payload = (row.payload ?? {}) as Record<string, unknown>;
    return {
      id: row.id,
      productId,
      delta: typeof payload.delta === "number" ? payload.delta : 0,
      reason: (
        payload.reason === "damage" ||
        payload.reason === "manual_correction" ||
        payload.reason === "return" ||
        payload.reason === "transfer" ||
        payload.reason === "cancellation"
          ? payload.reason
          : "restock"
      ) as InventoryAdjustmentReason,
      note: typeof payload.note === "string" ? payload.note : "",
      createdAt: row.created_at,
    };
  });
}

async function getProductRows() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, sku, description, status, categories(name, slug), collections(name, slug)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ProductRow[];
}

async function getVariantsMap(productIds: string[]) {
  const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));
  if (!uniqueIds.length) return {} as Record<string, ProductVariantRecord[]>;

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("id, product_id, title, sku, price_inr, compare_at_price_inr, stock_quantity, attributes, is_default")
    .in("product_id", uniqueIds)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const map: Record<string, ProductVariantRecord[]> = {};
  for (const row of data ?? []) {
    const entry = {
      id: row.id,
      productId: row.product_id,
      title: row.title,
      sku: row.sku,
      priceInr: row.price_inr,
      compareAtPriceInr: row.compare_at_price_inr,
      stockQuantity: row.stock_quantity,
      attributes: (row.attributes ?? {}) as Record<string, string>,
      isDefault: row.is_default,
    } satisfies ProductVariantRecord;
    map[row.product_id] = [...(map[row.product_id] ?? []), entry];
  }

  uniqueIds.forEach((productId) => {
    if (!map[productId]) map[productId] = [];
  });

  return map;
}

function buildInventoryRecord(row: ProductRow, settings: ProductAdminSettingsRecord, inventorySettings: InventorySettingsRecord, variants: ProductVariantRecord[]): InventoryRecord {
  const hasVariants = variants.length > 0;
  const availableStock = hasVariants ? variants.reduce((sum, variant) => sum + variant.stockQuantity, 0) : settings.inventoryQuantity;

  return {
    productId: row.id,
    productName: row.name,
    productSlug: row.slug,
    productStatus: row.status,
    sku: row.sku ?? settings.productId,
    category: row.categories?.[0]?.name ?? "Uncategorized",
    collection: row.collections?.[0]?.name ?? "No collection",
    availableStock,
    reservedStock: inventorySettings.reservedStock,
    incomingStock: inventorySettings.incomingStock,
    safetyStock: inventorySettings.safetyStock,
    location: inventorySettings.location,
    inventoryTracking: settings.inventoryTracking,
    continueSellingWhenOutOfStock: settings.continueSellingWhenOutOfStock,
    hasVariants,
    variantCount: variants.length,
    stockStatus: resolveInventoryStatus({
      inventoryTracking: settings.inventoryTracking,
      availableStock,
      safetyStock: inventorySettings.safetyStock,
    }),
    updatedAt: inventorySettings.updatedAt ?? settings.updatedAt,
  };
}

export async function getInventoryRecords() {
  const products = await getProductRows();
  const productIds = products.map((product) => product.id);
  const [adminSettingsMap, inventorySettingsMap, variantsMap] = await Promise.all([
    getProductAdminSettingsMap(productIds),
    getInventorySettingsMap(productIds),
    getVariantsMap(productIds),
  ]);

  return products
    .map((row) =>
      buildInventoryRecord(
        row,
        adminSettingsMap[row.id],
        inventorySettingsMap[row.id],
        variantsMap[row.id] ?? [],
      ),
    )
    .filter((record) => record.inventoryTracking || record.hasVariants || record.availableStock > 0 || record.incomingStock > 0);
}

export async function getInventoryRecordById(productId: string): Promise<InventoryDetail | null> {
  const products = await getProductRows();
  const row = products.find((product) => product.id === productId);
  if (!row) return null;

  const [adminSettingsMap, inventorySettingsMap, variantsMap, adjustments] = await Promise.all([
    getProductAdminSettingsMap([productId]),
    getInventorySettingsMap([productId]),
    getVariantsMap([productId]),
    getInventoryAdjustments(productId),
  ]);

  const base = buildInventoryRecord(
    row,
    adminSettingsMap[productId],
    inventorySettingsMap[productId],
    variantsMap[productId] ?? [],
  );

  return {
    ...base,
    productDescription: row.description ?? "",
    vendor: adminSettingsMap[productId].vendor ?? "Sofi Knots",
    barcode: adminSettingsMap[productId].barcode ?? "",
    variants: variantsMap[productId] ?? [],
    adjustments,
  };
}

export async function updateInventoryRecord(
  productId: string,
  input: {
    sku: string;
    inventoryQuantity: number;
    inventoryTracking: boolean;
    continueSellingWhenOutOfStock: boolean;
    location: string;
    safetyStock: number;
    incomingStock: number;
    reservedStock: number;
    actorUserId?: string | null;
  },
) {
  const supabase = createAdminSupabaseClient();
  const settingsMap = await getProductAdminSettingsMap([productId]);
  const current = settingsMap[productId];

  const { error } = await supabase.from("products").update({ sku: input.sku || null, updated_at: new Date().toISOString() }).eq("id", productId);
  if (error) throw new Error(error.message);

  await createAuditLog({
    actorUserId: input.actorUserId ?? null,
    entityType: "product_admin",
    entityId: productId,
    action: "settings:update",
    payload: {
      vendor: current.vendor ?? "Sofi Knots",
      tags: current.tags,
      costPerItem: current.costPerItem,
      barcode: current.barcode,
      inventoryQuantity: input.inventoryQuantity,
      inventoryTracking: input.inventoryTracking,
      continueSellingWhenOutOfStock: input.continueSellingWhenOutOfStock,
      physicalProduct: current.physicalProduct,
      weight: current.weight,
      salesChannels: current.salesChannels,
    },
  });

  await createAuditLog({
    actorUserId: input.actorUserId ?? null,
    entityType: "inventory_settings",
    entityId: productId,
    action: "settings:update",
    payload: {
      location: input.location,
      safetyStock: input.safetyStock,
      incomingStock: input.incomingStock,
      reservedStock: input.reservedStock,
    },
  });
}

export async function createInventoryAdjustment(
  productId: string,
  input: {
    delta: number;
    reason: InventoryAdjustmentReason;
    note: string;
    actorUserId?: string | null;
  },
) {
  await createAuditLog({
    actorUserId: input.actorUserId ?? null,
    entityType: "inventory",
    entityId: productId,
    action: "adjustment:create",
    payload: {
      delta: input.delta,
      reason: input.reason,
      note: input.note,
    },
  });
}

export async function clearInventoryRecord(productId: string, actorUserId?: string | null) {
  await updateInventoryRecord(productId, {
    sku: "",
    inventoryQuantity: 0,
    inventoryTracking: false,
    continueSellingWhenOutOfStock: false,
    location: "Main studio",
    safetyStock: 0,
    incomingStock: 0,
    reservedStock: 0,
    actorUserId,
  });

  await createAuditLog({
    actorUserId: actorUserId ?? null,
    entityType: "inventory",
    entityId: productId,
    action: "record:clear",
    payload: {},
  });
}
