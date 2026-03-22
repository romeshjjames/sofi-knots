import type { ProductVariantRecord } from "@/lib/admin-data";

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock" | "not_tracked";

export type InventoryAdjustmentReason =
  | "restock"
  | "damage"
  | "manual_correction"
  | "return"
  | "transfer"
  | "cancellation";

export type InventoryAdjustmentRecord = {
  id: string;
  productId: string;
  delta: number;
  reason: InventoryAdjustmentReason;
  note: string;
  createdAt: string;
};

export type InventoryRecord = {
  productId: string;
  productName: string;
  productSlug: string;
  productStatus: "draft" | "active" | "archived";
  sku: string;
  category: string;
  collection: string;
  availableStock: number;
  reservedStock: number;
  incomingStock: number;
  safetyStock: number;
  location: string;
  inventoryTracking: boolean;
  continueSellingWhenOutOfStock: boolean;
  hasVariants: boolean;
  variantCount: number;
  stockStatus: InventoryStatus;
  updatedAt: string | null;
};

export type InventoryDetail = InventoryRecord & {
  productDescription: string;
  vendor: string;
  barcode: string;
  variants: ProductVariantRecord[];
  adjustments: InventoryAdjustmentRecord[];
};
