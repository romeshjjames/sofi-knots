export type CustomOrderStatus =
  | "new"
  | "under_review"
  | "contacted"
  | "awaiting_customer_response"
  | "quoted"
  | "awaiting_approval"
  | "approved"
  | "in_progress"
  | "completed"
  | "delivered"
  | "rejected"
  | "cancelled";

export type CustomOrderSummary = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  productType: string;
  requestSummary: string;
  budget: string;
  status: CustomOrderStatus;
  submittedAt: string;
  estimatedPrice: string;
  assignedTeamMember: string;
  expectedCompletionDate: string | null;
  updatedAt: string | null;
};

export type CustomOrderDetail = CustomOrderSummary & {
  customizationDetails: string;
  preferredColors: string;
  preferredMaterials: string;
  quantity: number | null;
  referenceNotes: string;
  referenceImages: string[];
  timelineNotes: string;
  internalNotes: string;
  productionTimeline: string;
  shippingEstimate: string;
  specialConditions: string;
  confirmedPrice: string;
  paymentStatus: string;
  trackingDetails: string;
  completionNotes: string;
  dispatchNotes: string;
  finalPaymentNotes: string;
  cancellationReason: string;
};
