import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { OrderDetail, OrderSummary } from "@/types/orders";

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  total_inr: number;
  subtotal_inr: number;
  shipping_inr: number;
  discount_inr: number;
  currency: string;
  notes: string | null;
  created_at: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  shipping_address: Record<string, string> | null;
  billing_address: Record<string, string> | null;
  customer_id?: string | null;
  customers: { id?: string | null; full_name: string | null; email: string | null; phone?: string | null }[] | null;
  order_items?: {
    id: string;
    product_name: string;
    sku: string | null;
    quantity: number;
    unit_price_inr: number;
    line_total_inr: number;
  }[];
};

type OrderWorkflowState = {
  tags: string[];
  internalComments: string | null;
  customItemNotes: string | null;
  shippingPartner: string | null;
  trackingNumber: string | null;
  shippingMethod: string | null;
  estimatedDelivery: string | null;
  cancellationReason: string | null;
  refundReason: string | null;
  refundAmountInr: number | null;
  refundShipping: boolean;
  restockItems: boolean;
  archived: boolean;
};

const defaultOrderWorkflowState: OrderWorkflowState = {
  tags: [],
  internalComments: null,
  customItemNotes: null,
  shippingPartner: null,
  trackingNumber: null,
  shippingMethod: null,
  estimatedDelivery: null,
  cancellationReason: null,
  refundReason: null,
  refundAmountInr: null,
  refundShipping: false,
  restockItems: true,
  archived: false,
};

function normalizeOrderWorkflowState(payload: Record<string, unknown> | null | undefined): OrderWorkflowState {
  return {
    tags: Array.isArray(payload?.tags) ? payload.tags.filter((value): value is string => typeof value === "string") : [],
    internalComments: typeof payload?.internalComments === "string" ? payload.internalComments : null,
    customItemNotes: typeof payload?.customItemNotes === "string" ? payload.customItemNotes : null,
    shippingPartner: typeof payload?.shippingPartner === "string" ? payload.shippingPartner : null,
    trackingNumber: typeof payload?.trackingNumber === "string" ? payload.trackingNumber : null,
    shippingMethod: typeof payload?.shippingMethod === "string" ? payload.shippingMethod : null,
    estimatedDelivery: typeof payload?.estimatedDelivery === "string" ? payload.estimatedDelivery : null,
    cancellationReason: typeof payload?.cancellationReason === "string" ? payload.cancellationReason : null,
    refundReason: typeof payload?.refundReason === "string" ? payload.refundReason : null,
    refundAmountInr: typeof payload?.refundAmountInr === "number" ? payload.refundAmountInr : null,
    refundShipping: payload?.refundShipping === true,
    restockItems: payload?.restockItems !== false,
    archived: payload?.archived === true,
  };
}

async function getOrderWorkflowStateMap(orderIds: string[]) {
  const uniqueIds = Array.from(new Set(orderIds.filter(Boolean)));
  if (!uniqueIds.length) return {} as Record<string, OrderWorkflowState>;

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("entity_id, payload, created_at")
    .eq("entity_type", "order_workflow")
    .eq("action", "workflow:update")
    .in("entity_id", uniqueIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const map: Record<string, OrderWorkflowState> = {};
  for (const row of data ?? []) {
    if (map[row.entity_id]) continue;
    map[row.entity_id] = normalizeOrderWorkflowState((row.payload ?? {}) as Record<string, unknown>);
  }

  uniqueIds.forEach((orderId) => {
    if (!map[orderId]) {
      map[orderId] = defaultOrderWorkflowState;
    }
  });

  return map;
}

function mapOrderSummary(row: OrderRow, workflow: OrderWorkflowState): OrderSummary {
  const customer = row.customers?.[0];
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status,
    totalInr: row.total_inr,
    createdAt: row.created_at,
    customerName: customer?.full_name || "Guest Customer",
    customerEmail: customer?.email || "No email",
    customerPhone: customer?.phone || null,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    isArchived: workflow.archived,
    tags: workflow.tags,
  };
}

function mapOrderDetail(row: OrderRow, workflow: OrderWorkflowState): OrderDetail {
  return {
    ...mapOrderSummary(row, workflow),
    subtotalInr: row.subtotal_inr,
    shippingInr: row.shipping_inr,
    discountInr: row.discount_inr,
    currency: row.currency,
    notes: row.notes,
    shippingAddress: row.shipping_address,
    billingAddress: row.billing_address,
    internalComments: workflow.internalComments,
    customItemNotes: workflow.customItemNotes,
    shippingPartner: workflow.shippingPartner,
    trackingNumber: workflow.trackingNumber,
    shippingMethod: workflow.shippingMethod,
    estimatedDelivery: workflow.estimatedDelivery,
    cancellationReason: workflow.cancellationReason,
    refundReason: workflow.refundReason,
    refundAmountInr: workflow.refundAmountInr,
    refundShipping: workflow.refundShipping,
    restockItems: workflow.restockItems,
    items: (row.order_items ?? []).map((item) => ({
      id: item.id,
      productName: item.product_name,
      sku: item.sku,
      quantity: item.quantity,
      unitPriceInr: item.unit_price_inr,
      lineTotalInr: item.line_total_inr,
    })),
  };
}

export async function getOrders() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        customer_id,
        order_number,
        status,
        payment_status,
        fulfillment_status,
        total_inr,
        subtotal_inr,
        shipping_inr,
        discount_inr,
        currency,
        notes,
        created_at,
        razorpay_order_id,
        razorpay_payment_id,
        shipping_address,
        billing_address,
        customers(id, full_name, email, phone)
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as OrderRow[];
  const workflowMap = await getOrderWorkflowStateMap(rows.map((row) => row.id));
  return rows
    .map((row) => mapOrderSummary(row, workflowMap[row.id] ?? defaultOrderWorkflowState))
    .filter((order) => !order.isArchived);
}

export async function getOrderById(id: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        customer_id,
        order_number,
        status,
        payment_status,
        fulfillment_status,
        total_inr,
        subtotal_inr,
        shipping_inr,
        discount_inr,
        currency,
        notes,
        created_at,
        razorpay_order_id,
        razorpay_payment_id,
        shipping_address,
        billing_address,
        customers(id, full_name, email, phone),
        order_items(id, product_name, sku, quantity, unit_price_inr, line_total_inr)
      `,
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  const workflowMap = await getOrderWorkflowStateMap([id]);
  return mapOrderDetail(data as OrderRow, workflowMap[id] ?? defaultOrderWorkflowState);
}

export async function updateOrderStatuses(
  id: string,
  updates: {
    status?: string;
    paymentStatus?: string;
    fulfillmentStatus?: string;
    notes?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    shippingAddress?: Record<string, string> | null;
    billingAddress?: Record<string, string> | null;
    tags?: string[];
    internalComments?: string;
    customItemNotes?: string;
    shippingPartner?: string;
    trackingNumber?: string;
    shippingMethod?: string;
    estimatedDelivery?: string;
    cancellationReason?: string;
    refundReason?: string;
    refundAmountInr?: number | null;
    refundShipping?: boolean;
    restockItems?: boolean;
    archived?: boolean;
  },
) {
  const supabase = createAdminSupabaseClient();
  const { data: currentOrder, error: currentOrderError } = await supabase
    .from("orders")
    .select("id, order_number, customer_id")
    .eq("id", id)
    .single();

  if (currentOrderError) {
    throw new Error(currentOrderError.message);
  }

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: updates.status,
      payment_status: updates.paymentStatus,
      fulfillment_status: updates.fulfillmentStatus,
      notes: updates.notes,
      shipping_address: updates.shippingAddress,
      billing_address: updates.billingAddress,
    })
    .eq("id", id)
    .select("id, order_number")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (currentOrder.customer_id && (updates.customerName || updates.customerEmail || updates.customerPhone !== undefined)) {
    const { error: customerError } = await supabase
      .from("customers")
      .update({
        full_name: updates.customerName,
        email: updates.customerEmail,
        phone: updates.customerPhone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentOrder.customer_id);

    if (customerError) {
      throw new Error(customerError.message);
    }
  }

  const { error: workflowError } = await supabase.from("audit_logs").insert({
    entity_type: "order_workflow",
    entity_id: id,
    action: "workflow:update",
    payload: {
      tags: updates.tags ?? [],
      internalComments: updates.internalComments || null,
      customItemNotes: updates.customItemNotes || null,
      shippingPartner: updates.shippingPartner || null,
      trackingNumber: updates.trackingNumber || null,
      shippingMethod: updates.shippingMethod || null,
      estimatedDelivery: updates.estimatedDelivery || null,
      cancellationReason: updates.cancellationReason || null,
      refundReason: updates.refundReason || null,
      refundAmountInr: typeof updates.refundAmountInr === "number" ? updates.refundAmountInr : null,
      refundShipping: updates.refundShipping === true,
      restockItems: updates.restockItems !== false,
      archived: updates.archived === true,
    },
  });

  if (workflowError) {
    throw new Error(workflowError.message);
  }

  return data;
}

type CheckoutCustomerInput = {
  email: string;
  fullName: string;
  phone?: string;
};

type CheckoutAddressInput = {
  name: string;
  line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
};

type CheckoutItemInput = {
  productId: string;
  quantity: number;
};

export async function createPendingOrder(input: {
  customer: CheckoutCustomerInput;
  shippingAddress: CheckoutAddressInput;
  billingAddress: CheckoutAddressInput;
  items: CheckoutItemInput[];
  notes?: string;
}) {
  const supabase = createAdminSupabaseClient();

  const { data: productRows, error: productError } = await supabase
    .from("products")
    .select("id, name, slug, price_inr")
    .in("id", input.items.map((item) => item.productId));

  if (productError) {
    throw new Error(productError.message);
  }

  const products = new Map((productRows ?? []).map((product) => [product.id, product]));
  const subtotal = input.items.reduce((sum, item) => {
    const product = products.get(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found.`);
    }
    return sum + product.price_inr * item.quantity;
  }, 0);

  const shipping = subtotal > 1999 ? 0 : 120;
  const total = subtotal + shipping;

  let customerId: string | null = null;
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("email", input.customer.email)
    .maybeSingle();

  if (existingCustomer?.id) {
    customerId = existingCustomer.id;
    await supabase
      .from("customers")
      .update({
        full_name: input.customer.fullName,
        phone: input.customer.phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId);
  } else {
    const { data: createdCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({
        email: input.customer.email,
        full_name: input.customer.fullName,
        phone: input.customer.phone || null,
      })
      .select("id")
      .single();

    if (customerError) {
      throw new Error(customerError.message);
    }
    customerId = createdCustomer.id;
  }

  const orderNumber = `SK-${Date.now().toString().slice(-6)}`;
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      order_number: orderNumber,
      status: "pending",
      payment_status: "pending",
      fulfillment_status: "unfulfilled",
      currency: "INR",
      subtotal_inr: subtotal,
      shipping_inr: shipping,
      discount_inr: 0,
      total_inr: total,
      shipping_address: input.shippingAddress,
      billing_address: input.billingAddress,
      notes: input.notes || null,
    })
    .select("id, order_number, total_inr")
    .single();

  if (orderError) {
    throw new Error(orderError.message);
  }

  const orderItems = input.items.map((item) => {
    const product = products.get(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found.`);
    }
    return {
      order_id: order.id,
      product_id: product.id,
      variant_id: null,
      product_name: product.name,
      sku: product.slug,
      quantity: item.quantity,
      unit_price_inr: product.price_inr,
      line_total_inr: product.price_inr * item.quantity,
    };
  });

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return order;
}

export async function linkRazorpayOrder(orderId: string, razorpayOrderId: string) {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("orders")
    .update({ razorpay_order_id: razorpayOrderId })
    .eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markOrderPaid(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
}) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_status: "paid",
      razorpay_payment_id: input.razorpayPaymentId,
    })
    .eq("razorpay_order_id", input.razorpayOrderId)
    .select("id, order_number")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function markOrderFromWebhook(payload: {
  event: string;
  orderId?: string;
  paymentId?: string;
}) {
  const supabase = createAdminSupabaseClient();
  if (!payload.orderId) {
    throw new Error("Missing Razorpay order id in webhook payload.");
  }

  const updates =
    payload.event === "payment.captured"
      ? {
          status: "paid",
          payment_status: "paid",
          razorpay_payment_id: payload.paymentId ?? null,
        }
      : payload.event === "payment.failed"
        ? {
            status: "pending",
            payment_status: "failed",
            razorpay_payment_id: payload.paymentId ?? null,
          }
        : null;

  if (!updates) {
    return null;
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("razorpay_order_id", payload.orderId)
    .select("id, order_number")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
