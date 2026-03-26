import { unstable_noStore as noStore } from "next/cache";
import { getContactMessages, type ContactMessageRecord } from "@/lib/contact-messages";
import { getCustomOrders } from "@/lib/custom-orders";
import { getInventoryRecords } from "@/lib/inventory";
import { getOrders } from "@/lib/orders";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type AdminNotificationKind =
  | "new_order"
  | "new_custom_order"
  | "low_stock"
  | "return_request"
  | "contact_message";

export type AdminNotificationRecord = {
  id: string;
  kind: AdminNotificationKind;
  title: string;
  description: string;
  createdAt: string;
  href: string;
};

function isRecent(dateString: string, days: number) {
  const createdAt = new Date(dateString).getTime();
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return Number.isFinite(createdAt) && createdAt >= threshold;
}

function mapContactMessages(messages: ContactMessageRecord[]): AdminNotificationRecord[] {
  return messages.slice(0, 10).map((message) => ({
    id: `contact-${message.id}`,
    kind: "contact_message",
    title: `Contact message from ${message.name}`,
    description: message.subject,
    createdAt: message.createdAt,
    href: "/contact",
  }));
}

async function getReturnRequestNotifications(): Promise<AdminNotificationRecord[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("entity_id, payload, created_at")
    .eq("entity_type", "order_workflow")
    .eq("action", "workflow:update")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  const returnLogs = (data ?? []).filter((row) => {
    const payload = (row.payload ?? {}) as Record<string, unknown>;
    return typeof payload.refundReason === "string" && payload.refundReason.trim().length > 0;
  });

  if (!returnLogs.length) return [];

  const orderIds = Array.from(new Set(returnLogs.map((row) => row.entity_id)));
  const { data: orders, error: orderError } = await supabase
    .from("orders")
    .select("id, order_number")
    .in("id", orderIds);

  if (orderError) {
    throw new Error(orderError.message);
  }

  const orderNumberMap = new Map((orders ?? []).map((order) => [order.id, order.order_number]));

  return returnLogs.map((row) => {
    const payload = (row.payload ?? {}) as Record<string, unknown>;
    const reason = typeof payload.refundReason === "string" ? payload.refundReason : "Refund requested";
    const orderNumber = orderNumberMap.get(row.entity_id) ?? row.entity_id;

    return {
      id: `return-${row.entity_id}-${row.created_at}`,
      kind: "return_request" as const,
      title: `Return request for ${orderNumber}`,
      description: reason,
      createdAt: row.created_at,
      href: `/admin/orders/${row.entity_id}`,
    };
  });
}

export async function getAdminNotifications(): Promise<AdminNotificationRecord[]> {
  noStore();

  const [orders, customOrders, inventoryRecords, contactMessages, returnRequests] = await Promise.all([
    getOrders(),
    getCustomOrders(),
    getInventoryRecords(),
    getContactMessages(),
    getReturnRequestNotifications(),
  ]);

  const orderNotifications: AdminNotificationRecord[] = orders
    .filter((order) => isRecent(order.createdAt, 14))
    .slice(0, 10)
    .map((order) => ({
      id: `order-${order.id}`,
      kind: "new_order",
      title: `New order ${order.orderNumber}`,
      description: `${order.customerName} placed an order for Rs. ${order.totalInr.toLocaleString("en-IN")}`,
      createdAt: order.createdAt,
      href: `/admin/orders/${order.id}`,
    }));

  const customOrderNotifications: AdminNotificationRecord[] = customOrders
    .filter((order) => order.status === "new" || order.status === "under_review" || isRecent(order.updatedAt ?? order.submittedAt, 14))
    .slice(0, 10)
    .map((order) => ({
      id: `custom-${order.id}`,
      kind: "new_custom_order",
      title: `Custom order from ${order.customerName}`,
      description: order.productType,
      createdAt: order.updatedAt ?? `${order.submittedAt}T00:00:00.000Z`,
      href: `/admin/custom-orders/${order.id}`,
    }));

  const lowStockNotifications: AdminNotificationRecord[] = inventoryRecords
    .filter((record) => record.stockStatus === "low_stock" || record.stockStatus === "out_of_stock")
    .slice(0, 10)
    .map((record) => ({
      id: `stock-${record.productId}`,
      kind: "low_stock",
      title: `${record.productName} needs stock attention`,
      description:
        record.stockStatus === "out_of_stock"
          ? "Product is out of stock"
          : `${record.availableStock} left in inventory`,
      createdAt: record.updatedAt ?? new Date().toISOString(),
      href: `/admin/inventory/${record.productId}`,
    }));

  return [
    ...orderNotifications,
    ...customOrderNotifications,
    ...lowStockNotifications,
    ...returnRequests,
    ...mapContactMessages(contactMessages),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAdminNotificationSummary() {
  const notifications = await getAdminNotifications();

  return {
    total: notifications.length,
    newOrders: notifications.filter((item) => item.kind === "new_order").length,
    customOrders: notifications.filter((item) => item.kind === "new_custom_order").length,
    lowStock: notifications.filter((item) => item.kind === "low_stock").length,
    returnRequests: notifications.filter((item) => item.kind === "return_request").length,
    contactMessages: notifications.filter((item) => item.kind === "contact_message").length,
  };
}
