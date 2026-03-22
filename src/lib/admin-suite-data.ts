import type { Collection, Product } from "@/types/commerce";
import type { OrderSummary } from "@/types/orders";

export type CustomerSummary = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orderCount: number;
  totalSpentInr: number;
  tags: string[];
  joinedAt: string;
  notes: string;
  wishlist: string[];
  addresses: { label: string; value: string[] }[];
};

export type DiscountSummary = {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: string;
  minimumOrder: string;
  expiresAt: string;
  usage: string;
  status: "active" | "scheduled" | "expired";
  appliesTo: string;
};

export type ReviewSummary = {
  id: string;
  customerName: string;
  productName: string;
  rating: number;
  status: "approved" | "pending" | "rejected";
  submittedAt: string;
  headline: string;
  body: string;
};

export type CustomOrderSummary = {
  id: string;
  customerName: string;
  email: string;
  productType: string;
  requestSummary: string;
  budget: string;
  status: "new" | "quoted" | "in_progress" | "won" | "closed";
  submittedAt: string;
  notes: string;
  referenceImages: string[];
};

export type InventorySummary = {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  reserved: number;
  incoming: number;
  status: "healthy" | "low" | "out";
};

export function getSampleCustomers(): CustomerSummary[] {
  return [
    {
      id: "cust-1",
      name: "Ananya Kapoor",
      email: "ananya.kapoor@gmail.com",
      phone: "+91 98765 12340",
      orderCount: 4,
      totalSpentInr: 24800,
      tags: ["VIP", "Repeat buyer"],
      joinedAt: "2026-01-18",
      notes: "Prefers limited-edition bags and often shops new launches within the first 24 hours.",
      wishlist: ["Rainbow Bloom Macrame Sling Bag", "Sunset Knot Clutch", "Heirloom Pearl Handbag"],
      addresses: [
        { label: "Shipping", value: ["Ananya Kapoor", "42 Lake View Road", "Bengaluru, Karnataka 560034", "India"] },
        { label: "Billing", value: ["Ananya Kapoor", "42 Lake View Road", "Bengaluru, Karnataka 560034", "India"] },
      ],
    },
    {
      id: "cust-2",
      name: "Rhea Menon",
      email: "rhea.menon@outlook.com",
      phone: "+91 99870 22341",
      orderCount: 2,
      totalSpentInr: 12950,
      tags: ["Custom order lead", "Newsletter"],
      joinedAt: "2026-02-09",
      notes: "Asked about a bridal gifting set and follows up quickly over email.",
      wishlist: ["Custom Ceremony Clutch", "Eucalyptus Wall Hanging"],
      addresses: [{ label: "Shipping", value: ["Rhea Menon", "17 Marine Drive", "Kochi, Kerala 682031", "India"] }],
    },
    {
      id: "cust-3",
      name: "Ishita Arora",
      email: "ishita.arora@gmail.com",
      phone: "+91 99000 31821",
      orderCount: 1,
      totalSpentInr: 6850,
      tags: ["First-time buyer"],
      joinedAt: "2026-03-01",
      notes: "Loves softer neutrals and requested care instructions after checkout.",
      wishlist: ["Ivory Meadow Crossbody"],
      addresses: [{ label: "Shipping", value: ["Ishita Arora", "12 Rose Garden Lane", "Delhi 110017", "India"] }],
    },
  ];
}

export function getSampleCustomerById(id: string) {
  return getSampleCustomers().find((customer) => customer.id === id) ?? null;
}

export function getSampleDiscounts(): DiscountSummary[] {
  return [
    {
      id: "disc-1",
      code: "NEWKNOTS10",
      type: "percentage",
      value: "10%",
      minimumOrder: "Rs. 4,500",
      expiresAt: "30 Apr 2026",
      usage: "122 / 300",
      status: "active",
      appliesTo: "First purchase",
    },
    {
      id: "disc-2",
      code: "PREMIUM750",
      type: "fixed",
      value: "Rs. 750",
      minimumOrder: "Rs. 8,000",
      expiresAt: "15 May 2026",
      usage: "43 / 75",
      status: "active",
      appliesTo: "Premium Collection",
    },
    {
      id: "disc-3",
      code: "FREESHIPWEEKEND",
      type: "free_shipping",
      value: "Free shipping",
      minimumOrder: "Rs. 2,500",
      expiresAt: "28 Mar 2026",
      usage: "Scheduled",
      status: "scheduled",
      appliesTo: "Online store",
    },
  ];
}

export function getSampleReviews(): ReviewSummary[] {
  return [
    {
      id: "rev-1",
      customerName: "Ananya Kapoor",
      productName: "Rainbow Bloom Macrame Sling Bag",
      rating: 5,
      status: "approved",
      submittedAt: "20 Mar 2026",
      headline: "Beautifully handcrafted and even better in person",
      body: "The stitch work feels premium, the colors are rich, and the bag sits beautifully for day events.",
    },
    {
      id: "rev-2",
      customerName: "Rhea Menon",
      productName: "Sunset Knot Clutch",
      rating: 4,
      status: "pending",
      submittedAt: "19 Mar 2026",
      headline: "Lovely gifting piece",
      body: "Would love a little more room inside, but the detailing and finish are gorgeous.",
    },
    {
      id: "rev-3",
      customerName: "Ishita Arora",
      productName: "Ivory Meadow Crossbody",
      rating: 2,
      status: "rejected",
      submittedAt: "12 Mar 2026",
      headline: "Courier delay issue",
      body: "The product is nice, but the original review was mostly about shipping delay rather than the bag itself.",
    },
  ];
}

export function getSampleReviewById(id: string) {
  return getSampleReviews().find((review) => review.id === id) ?? null;
}

export function getSampleCustomOrders(): CustomOrderSummary[] {
  return [
    {
      id: "co-1",
      customerName: "Rhea Menon",
      email: "rhea.menon@outlook.com",
      productType: "Bridal gifting set",
      requestSummary: "Three coordinated macrame clutches in muted ivory and sage with initials woven into the flap.",
      budget: "Rs. 18,000 - 22,000",
      status: "quoted",
      submittedAt: "21 Mar 2026",
      notes: "Waiting on final lining swatches before sending the revised quote.",
      referenceImages: ["Palette board", "Initial embroidery sketch", "Clutch silhouette"],
    },
    {
      id: "co-2",
      customerName: "Megha Sethi",
      email: "megha.sethi@gmail.com",
      productType: "Custom tote",
      requestSummary: "Large travel-friendly tote with hidden zip pocket and earthy clay, rust, and oat tones.",
      budget: "Rs. 9,000 - 12,500",
      status: "new",
      submittedAt: "20 Mar 2026",
      notes: "Needs a first response within 24 hours.",
      referenceImages: ["Pinterest tote inspiration"],
    },
    {
      id: "co-3",
      customerName: "Sara Thomas",
      email: "sara.thomas@gmail.com",
      productType: "Wall installation",
      requestSummary: "Large statement wall hanging for a boutique cafe opening in Goa.",
      budget: "Rs. 35,000+",
      status: "in_progress",
      submittedAt: "15 Mar 2026",
      notes: "Sampling approved. Production started for April install.",
      referenceImages: ["Cafe wall photo", "Palette selection"],
    },
  ];
}

export function getSampleCustomOrderById(id: string) {
  return getSampleCustomOrders().find((request) => request.id === id) ?? null;
}

export function buildInventoryRows(products: Product[]): InventorySummary[] {
  const rows = products.slice(0, 8).map((product, index) => {
    const stock = [24, 16, 6, 0, 13, 8, 28, 4][index] ?? 10;
    const reserved = [2, 1, 3, 0, 1, 2, 4, 1][index] ?? 0;
    const incoming = [12, 0, 5, 20, 8, 0, 0, 6][index] ?? 0;
    const status = stock === 0 ? "out" : stock <= 8 ? "low" : "healthy";

    return {
      id: product.id,
      name: product.name,
      sku: product.slug.toUpperCase().slice(0, 12),
      category: product.category,
      stock,
      reserved,
      incoming,
      status,
    } satisfies InventorySummary;
  });

  return rows;
}

export function buildBestSellerRows(products: Product[]) {
  return products.slice(0, 5).map((product, index) => ({
    id: product.id,
    name: product.name,
    unitsSold: [42, 34, 26, 18, 15][index] ?? 12,
    revenueInr: [121800, 98600, 75200, 51800, 44600][index] ?? 28000,
  }));
}

export function buildCollectionPerformanceRows(collections: Collection[]) {
  return collections.slice(0, 5).map((collection, index) => ({
    id: collection.id ?? collection.slug,
    name: collection.title,
    visits: [1280, 960, 744, 620, 490][index] ?? 320,
    conversionRate: [4.8, 4.2, 3.9, 3.1, 2.8][index] ?? 2.4,
    revenueInr: [148000, 121500, 86400, 67300, 48200][index] ?? 31000,
  }));
}

export function buildDashboardMetrics(input: {
  products: Product[];
  orders: OrderSummary[];
  collections: Collection[];
}) {
  const customers = getSampleCustomers();
  const customOrders = getSampleCustomOrders();
  const inventory = buildInventoryRows(input.products);
  const bestSellers = buildBestSellerRows(input.products);
  const collectionPerformance = buildCollectionPerformanceRows(input.collections);
  const revenueSeries = [
    { label: "Mon", revenue: 18000 },
    { label: "Tue", revenue: 12600 },
    { label: "Wed", revenue: 24500 },
    { label: "Thu", revenue: 19800 },
    { label: "Fri", revenue: 28600 },
    { label: "Sat", revenue: 32100 },
    { label: "Sun", revenue: 26700 },
  ];

  return {
    totalSalesInr: input.orders.reduce((sum, order) => sum + order.totalInr, 0),
    totalOrders: input.orders.length,
    totalProducts: input.products.length,
    totalCustomers: customers.length,
    pendingCustomOrders: customOrders.filter((item) => item.status === "new" || item.status === "quoted").length,
    recentOrders: input.orders.slice(0, 5),
    lowStock: inventory.filter((item) => item.status !== "healthy"),
    bestSellers,
    collectionPerformance,
    revenueSeries,
    quickActions: [
      { label: "Add product", href: "/admin/products" },
      { label: "Create collection", href: "/admin/collections" },
      { label: "Review custom requests", href: "/admin/custom-orders" },
      { label: "Write article", href: "/admin/content" },
    ],
  };
}
