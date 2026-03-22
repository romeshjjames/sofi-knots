export type DiscountType = "percentage" | "fixed" | "free_shipping" | "buy_x_get_y";
export type DiscountStatus = "active" | "scheduled" | "expired" | "draft";
export type DiscountEligibility = "all_products" | "specific_products" | "specific_collections";
export type DiscountCustomerEligibility = "all_customers" | "specific_tags" | "specific_customers";

export type DiscountSummary = {
  id: string;
  code: string;
  title: string;
  type: DiscountType;
  value: string;
  minimumOrderAmountInr: number | null;
  usageLimit: number | null;
  usageCount: number;
  oneUsePerCustomer: boolean;
  combinable: boolean;
  startsAt: string | null;
  endsAt: string | null;
  status: DiscountStatus;
  eligibleProducts: string[];
  eligibleCollections: string[];
  eligibleCustomers: string[];
  eligibleCustomerTags: string[];
  customerEligibility: DiscountCustomerEligibility;
  appliesTo: string;
  revenueImpactInr: number;
  orderCount: number;
  updatedAt: string | null;
};

export type DiscountDetail = DiscountSummary & {
  automaticName: string;
  eligibility: DiscountEligibility;
};
