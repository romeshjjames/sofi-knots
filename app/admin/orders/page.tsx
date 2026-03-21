import Link from "next/link";
import { AdminBadge, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { getOrders } from "@/lib/orders";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminOrdersPage() {
  await requireAdminPage(["super_admin", "order_admin"]);
  const orders = await getOrders();
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
  const openOrders = orders.filter((order) => order.fulfillmentStatus !== "delivered");
  const revenue = orders.reduce((sum, order) => sum + order.totalInr, 0);

  const paymentTone = (value: string) =>
    value === "paid" ? "success" : value === "failed" ? "danger" : value === "authorized" ? "info" : "warning";
  const fulfillmentTone = (value: string) =>
    value === "delivered" ? "success" : value === "shipped" ? "info" : value === "returned" ? "danger" : "warning";

  return (
    <AdminShell
      active="orders"
      eyebrow="Order operations"
      title="Orders and Payments"
      description="Track every order from payment capture through fulfillment, with customer context and Razorpay references in a single operational queue."
      stats={[
        { label: "Total orders", value: `${orders.length}`, hint: "All orders currently visible in the admin." },
        { label: "Open orders", value: `${openOrders.length}`, hint: "Orders still moving through fulfillment." },
        { label: "Paid", value: `${paidOrders.length}`, hint: "Orders with successful payment capture." },
        { label: "Revenue", value: `Rs. ${revenue.toLocaleString("en-IN")}`, hint: "Total value represented by visible orders." },
      ]}
    >
      <AdminPanel
        title="Order queue"
        description="A denser operations table inspired by modern commerce back offices. Use it to scan customer, payment, and fulfillment status at a glance."
      >
        <div className="overflow-hidden rounded-[24px] border border-brand-sand/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fcfaf5]">
              <tr>
                <th className="px-5 py-4 font-medium text-brand-brown">Order</th>
                <th className="px-5 py-4 font-medium text-brand-brown">Customer</th>
                <th className="px-5 py-4 font-medium text-brand-brown">Payment</th>
                <th className="px-5 py-4 font-medium text-brand-brown">Fulfillment</th>
                <th className="px-5 py-4 font-medium text-brand-brown">Total</th>
                <th className="px-5 py-4 font-medium text-brand-brown">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-brand-sand/30 bg-white">
                  <td className="px-5 py-4 align-top">
                    <div className="font-medium text-brand-brown">{order.orderNumber}</div>
                    <div className="mt-1 text-xs text-brand-taupe">{new Date(order.createdAt).toLocaleString("en-IN")}</div>
                  </td>
                  <td className="px-5 py-4 align-top text-brand-warm">
                    <div>{order.customerName}</div>
                    <div className="mt-1 text-xs text-brand-taupe">{order.customerEmail}</div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <AdminBadge tone={paymentTone(order.paymentStatus)}>{order.paymentStatus}</AdminBadge>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <AdminBadge tone={fulfillmentTone(order.fulfillmentStatus)}>{order.fulfillmentStatus}</AdminBadge>
                  </td>
                  <td className="px-5 py-4 align-top font-medium text-brand-brown">Rs. {order.totalInr.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-4 align-top">
                    <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-brand-gold hover:text-brand-brown">
                      View order
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
