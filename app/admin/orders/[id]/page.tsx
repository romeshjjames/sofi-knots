import Link from "next/link";
import { ArrowLeftRight, CreditCard, Truck } from "lucide-react";
import { AdminBadge, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { getAuditLogs } from "@/lib/admin-data";
import { getOrderById } from "@/lib/orders";
import { requireAdminPage } from "@/lib/supabase/auth";

function formatAddress(address?: Record<string, string> | null) {
  if (!address) return ["No address available"];
  return Object.values(address).filter(Boolean);
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  await requireAdminPage(["super_admin", "order_admin"]);
  const [order, auditLogs] = await Promise.all([getOrderById(params.id), getAuditLogs("order", params.id)]);
  const paymentTone = order.paymentStatus === "paid" ? "success" : order.paymentStatus === "failed" ? "danger" : "warning";
  const fulfillmentTone =
    order.fulfillmentStatus === "delivered" ? "success" : order.fulfillmentStatus === "shipped" ? "info" : order.fulfillmentStatus === "returned" ? "danger" : "warning";

  return (
    <AdminShell
      active="orders"
      eyebrow="Order detail"
      title={`Order ${order.orderNumber}`}
      description="Review customer data, payment references, line items, addresses, and operational notes from a single order workspace."
      actions={
        <Link href="/admin/orders" className="brand-btn-outline whitespace-nowrap px-5 py-3">
          Back to orders
        </Link>
      }
      stats={[
        { label: "Total", value: `Rs. ${order.totalInr.toLocaleString("en-IN")}`, hint: "Final order value including shipping and discounts." },
        { label: "Payment", value: order.paymentStatus, hint: order.razorpayPaymentId || "No payment id linked yet." },
        { label: "Fulfillment", value: order.fulfillmentStatus, hint: "Current shipment progress for this order." },
        { label: "Customer", value: order.customerName, hint: order.customerEmail },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <AdminPanel title="Order summary" description="Financial and payment-linked overview for this order.">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#fcfaf5] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Operational status</p>
                <p className="mt-2 font-medium capitalize text-brand-brown">{order.status}</p>
              </div>
              <div className="rounded-2xl bg-[#fcfaf5] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Payment</p>
                <div className="mt-2">
                  <AdminBadge tone={paymentTone}>{order.paymentStatus}</AdminBadge>
                </div>
              </div>
              <div className="rounded-2xl bg-[#fcfaf5] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Fulfillment</p>
                <div className="mt-2">
                  <AdminBadge tone={fulfillmentTone}>{order.fulfillmentStatus}</AdminBadge>
                </div>
              </div>
              <div className="rounded-2xl bg-[#fcfaf5] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Currency</p>
                <p className="mt-2 font-medium text-brand-brown">{order.currency}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-brand-sand/40 p-4">
                <div className="flex items-center gap-2 text-brand-taupe">
                  <CreditCard size={15} />
                  Razorpay order
                </div>
                <p className="mt-2 text-sm text-brand-brown">{order.razorpayOrderId || "Not linked"}</p>
              </div>
              <div className="rounded-2xl border border-brand-sand/40 p-4">
                <div className="flex items-center gap-2 text-brand-taupe">
                  <ArrowLeftRight size={15} />
                  Razorpay payment
                </div>
                <p className="mt-2 text-sm text-brand-brown">{order.razorpayPaymentId || "Not linked"}</p>
              </div>
              <div className="rounded-2xl border border-brand-sand/40 p-4">
                <div className="flex items-center gap-2 text-brand-taupe">
                  <Truck size={15} />
                  Shipping cost
                </div>
                <p className="mt-2 text-sm text-brand-brown">Rs. {order.shippingInr.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title="Customer" description="Buyer contact details associated with this order.">
            <div className="space-y-2 text-sm text-brand-warm">
              <div className="text-lg font-medium text-brand-brown">{order.customerName}</div>
              <div>{order.customerEmail}</div>
            </div>
          </AdminPanel>

          <AdminPanel title="Order items" description="Products purchased in this order, with quantities and line totals.">
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4 text-sm text-brand-warm">
                  <div>
                    <div className="font-medium text-brand-brown">{item.productName}</div>
                    <div className="mt-1 text-xs text-brand-taupe">SKU: {item.sku || "N/A"} | Qty: {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-brand-brown">Rs. {item.lineTotalInr.toLocaleString("en-IN")}</div>
                    <div className="text-xs text-brand-taupe">Rs. {item.unitPriceInr.toLocaleString("en-IN")} each</div>
                  </div>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>

        <div className="space-y-6">
          <OrderStatusForm order={order} />
          <AdminPanel title="Shipping address" description="Where this order should be delivered.">
            <div className="space-y-1 text-sm text-brand-warm">
              {formatAddress(order.shippingAddress).map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </AdminPanel>
          <AdminPanel title="Billing address" description="Billing details stored for payment and invoicing.">
            <div className="space-y-1 text-sm text-brand-warm">
              {formatAddress(order.billingAddress).map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </AdminPanel>
          <AdminPanel title="Timeline" description="Recent operational events recorded for this order.">
            <div className="space-y-3">
              {auditLogs.length ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
                    <div className="text-sm font-medium text-brand-brown">{log.action}</div>
                    <div className="mt-1 text-xs text-brand-taupe">{new Date(log.createdAt).toLocaleString("en-IN")}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-brand-warm">No order events logged yet.</p>
              )}
            </div>
          </AdminPanel>
        </div>
      </div>
    </AdminShell>
  );
}
