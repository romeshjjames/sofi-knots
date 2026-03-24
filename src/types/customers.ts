export type CustomerAddress = {
  label: string;
  value: string[];
};

export type CustomerOrderHistory = {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalInr: number;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
};

export type CustomerSummary = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  orderCount: number;
  totalSpentInr: number;
  averageOrderValueInr: number;
  tags: string[];
  joinedAt: string;
  lastOrderDate: string | null;
  notes: string;
  addressCount: number;
};

export type CustomerTimelineEntry = {
  id: string;
  action: string;
  createdAt: string;
  payload: Record<string, unknown>;
};

export type CustomerDetail = CustomerSummary & {
  addresses: CustomerAddress[];
  orderHistory: CustomerOrderHistory[];
  timeline: CustomerTimelineEntry[];
};
