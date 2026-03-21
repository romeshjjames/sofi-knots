export type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  totalInr: number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
};

export type OrderItem = {
  id: string;
  productName: string;
  sku?: string | null;
  quantity: number;
  unitPriceInr: number;
  lineTotalInr: number;
};

export type OrderDetail = OrderSummary & {
  subtotalInr: number;
  shippingInr: number;
  discountInr: number;
  currency: string;
  notes?: string | null;
  shippingAddress?: Record<string, string> | null;
  billingAddress?: Record<string, string> | null;
  items: OrderItem[];
};
