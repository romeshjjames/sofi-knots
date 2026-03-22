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
  customerPhone?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  isArchived?: boolean;
  tags?: string[];
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
  internalComments?: string | null;
  customItemNotes?: string | null;
  shippingPartner?: string | null;
  trackingNumber?: string | null;
  shippingMethod?: string | null;
  estimatedDelivery?: string | null;
  cancellationReason?: string | null;
  refundReason?: string | null;
  refundAmountInr?: number | null;
  refundShipping?: boolean;
  restockItems?: boolean;
};
