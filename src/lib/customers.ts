import { createAuditLog, getAuditLogs } from "@/lib/admin-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { CustomerAddress, CustomerDetail, CustomerOrderHistory, CustomerSummary } from "@/types/customers";

type CustomerRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
};

type OrderRow = {
  id: string;
  customer_id: string | null;
  order_number: string;
  total_inr: number;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
};

type CustomerAdminPayload = {
  isActive?: boolean;
  tags?: string[];
  notes?: string | null;
  addresses?: CustomerAddress[];
};

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function normalizeCustomerAdminPayload(payload: Record<string, unknown> | null | undefined) {
  const typed = (payload ?? {}) as CustomerAdminPayload;
  return {
    isActive: typed.isActive !== false,
    tags: Array.isArray(typed.tags) ? typed.tags.filter((value): value is string => typeof value === "string") : [],
    notes: typeof typed.notes === "string" ? typed.notes : "",
    addresses: Array.isArray(typed.addresses)
      ? typed.addresses
          .map((address) => {
            if (!address || typeof address !== "object") return null;
            const entry = address as Record<string, unknown>;
            return {
              label: typeof entry.label === "string" ? entry.label : "Address",
              value: Array.isArray(entry.value) ? entry.value.filter((value): value is string => typeof value === "string") : [],
            } satisfies CustomerAddress;
          })
          .filter((value): value is CustomerAddress => Boolean(value))
      : [],
  };
}

async function getCustomerAdminStateMap(customerIds: string[]) {
  const ids = Array.from(new Set(customerIds.filter(Boolean)));
  if (!ids.length) return {} as Record<string, ReturnType<typeof normalizeCustomerAdminPayload>>;

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("entity_id, payload, created_at")
    .eq("entity_type", "customer_admin")
    .eq("action", "profile:update")
    .in("entity_id", ids)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const map: Record<string, ReturnType<typeof normalizeCustomerAdminPayload>> = {};
  for (const row of data ?? []) {
    if (map[row.entity_id]) continue;
    map[row.entity_id] = normalizeCustomerAdminPayload((row.payload ?? {}) as Record<string, unknown>);
  }

  ids.forEach((id) => {
    if (!map[id]) {
      map[id] = { isActive: true, tags: [], notes: "", addresses: [] };
    }
  });

  return map;
}

function mapCustomerSummary(row: CustomerRow, customerOrders: OrderRow[], adminState: ReturnType<typeof normalizeCustomerAdminPayload>): CustomerSummary {
  const fullName = row.full_name?.trim() || "Unnamed Customer";
  const totalSpentInr = customerOrders.reduce((sum, order) => sum + order.total_inr, 0);
  const orderCount = customerOrders.length;
  const lastOrderDate = customerOrders[0]?.created_at ?? null;
  const { firstName, lastName } = splitName(fullName);

  return {
    id: row.id,
    fullName,
    firstName,
    lastName,
    email: row.email,
    phone: row.phone || "",
    isActive: adminState.isActive,
    orderCount,
    totalSpentInr,
    averageOrderValueInr: orderCount ? Math.round(totalSpentInr / orderCount) : 0,
    tags: adminState.tags,
    joinedAt: row.created_at,
    lastOrderDate,
    notes: adminState.notes,
    addressCount: adminState.addresses.length,
  };
}

function mapOrderHistory(row: OrderRow): CustomerOrderHistory {
  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at,
    totalInr: row.total_inr,
    status: row.status,
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status,
  };
}

export async function getCustomers() {
  const supabase = createAdminSupabaseClient();
  const [{ data: customers, error: customersError }, { data: orders, error: ordersError }] = await Promise.all([
    supabase.from("customers").select("id, email, full_name, phone, created_at").order("created_at", { ascending: false }),
    supabase.from("orders").select("id, customer_id, order_number, total_inr, status, payment_status, fulfillment_status, created_at").order("created_at", { ascending: false }),
  ]);

  if (customersError) throw new Error(customersError.message);
  if (ordersError) throw new Error(ordersError.message);

  const customerRows = (customers ?? []) as CustomerRow[];
  const orderRows = (orders ?? []) as OrderRow[];
  const adminStateMap = await getCustomerAdminStateMap(customerRows.map((row) => row.id));

  return customerRows.map((row) => {
    const customerOrders = orderRows.filter((order) => order.customer_id === row.id);
    return mapCustomerSummary(row, customerOrders, adminStateMap[row.id] ?? { isActive: true, tags: [], notes: "", addresses: [] });
  });
}

export async function getCustomerById(id: string): Promise<CustomerDetail | null> {
  const supabase = createAdminSupabaseClient();
  const [{ data: customer, error: customerError }, { data: orders, error: ordersError }] = await Promise.all([
    supabase.from("customers").select("id, email, full_name, phone, created_at").eq("id", id).maybeSingle(),
    supabase
      .from("orders")
      .select("id, customer_id, order_number, total_inr, status, payment_status, fulfillment_status, created_at")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (customerError) throw new Error(customerError.message);
  if (ordersError) throw new Error(ordersError.message);
  if (!customer) return null;

  const adminStateMap = await getCustomerAdminStateMap([id]);
  const adminState = adminStateMap[id] ?? { isActive: true, tags: [], notes: "", addresses: [] };
  const orderRows = (orders ?? []) as OrderRow[];
  const summary = mapCustomerSummary(customer as CustomerRow, orderRows, adminState);
  const timeline = await getAuditLogs("customer_admin", id);

  return {
    ...summary,
    addresses: adminState.addresses,
    orderHistory: orderRows.map(mapOrderHistory),
    timeline: timeline.map((entry) => ({
      id: entry.id,
      action: entry.action,
      createdAt: entry.createdAt,
      payload: entry.payload,
    })),
  };
}

export async function createCustomer(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  addresses?: CustomerAddress[];
  isActive?: boolean;
  actorUserId?: string | null;
}) {
  const supabase = createAdminSupabaseClient();
  const fullName = `${input.firstName} ${input.lastName}`.trim();

  const { data, error } = await supabase
    .from("customers")
    .insert({
      full_name: fullName || null,
      email: input.email,
      phone: input.phone || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await createAuditLog({
    actorUserId: input.actorUserId ?? null,
    entityType: "customer_admin",
    entityId: data.id,
    action: "profile:update",
    payload: {
      isActive: input.isActive !== false,
      tags: input.tags ?? [],
      notes: input.notes ?? "",
      addresses: input.addresses ?? [],
    },
  });

  return data.id as string;
}

export async function updateCustomer(
  id: string,
  input: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    notes?: string;
    tags?: string[];
    addresses?: CustomerAddress[];
    isActive?: boolean;
    actorUserId?: string | null;
  },
) {
  const supabase = createAdminSupabaseClient();
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const existingState = await getCustomerAdminStateById(id);

  const { error } = await supabase
    .from("customers")
    .update({
      full_name: fullName || null,
      email: input.email,
      phone: input.phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await createAuditLog({
    actorUserId: input.actorUserId ?? null,
    entityType: "customer_admin",
    entityId: id,
    action: "profile:update",
    payload: {
      isActive: input.isActive !== false,
      tags: input.tags ?? existingState.tags,
      notes: input.notes ?? existingState.notes,
      addresses: input.addresses ?? existingState.addresses,
    },
  });
}

export async function deleteCustomer(id: string, actorUserId?: string | null) {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await createAuditLog({
    actorUserId: actorUserId ?? null,
    entityType: "customer_admin",
    entityId: id,
    action: "profile:delete",
    payload: {},
  });
}

export async function getCustomerAdminStateById(id: string) {
  const map = await getCustomerAdminStateMap([id]);
  return map[id] ?? { isActive: true, tags: [], notes: "", addresses: [] };
}

export async function getCustomerAdminStateByEmail(email: string) {
  const supabase = createAdminSupabaseClient();
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.from("customers").select("id").eq("email", normalizedEmail).maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.id) {
    return { customerId: null, state: { isActive: true, tags: [], notes: "", addresses: [] } };
  }

  const state = await getCustomerAdminStateById(data.id);
  return { customerId: data.id as string, state };
}
