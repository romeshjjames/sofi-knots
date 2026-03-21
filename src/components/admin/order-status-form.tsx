"use client";

import { useState, useTransition } from "react";
import type { OrderDetail } from "@/types/orders";

type OrderStatusFormProps = {
  order: OrderDetail;
};

export function OrderStatusForm({ order }: OrderStatusFormProps) {
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [fulfillmentStatus, setFulfillmentStatus] = useState(order.fulfillmentStatus);
  const [notes, setNotes] = useState(order.notes || "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid gap-4 rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
      <div>
        <h2 className="font-serif text-2xl text-brand-brown">Update Order Status</h2>
        <p className="text-sm text-brand-warm">Track payment, fulfillment, and internal handling notes from one operational panel.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <select className="brand-input" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <select className="brand-input" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
          <option value="pending">Pending</option>
          <option value="authorized">Authorized</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select className="brand-input" value={fulfillmentStatus} onChange={(event) => setFulfillmentStatus(event.target.value)}>
          <option value="unfulfilled">Unfulfilled</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="returned">Returned</option>
        </select>
      </div>
      <textarea className="brand-input min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Internal notes" />
      <button
        type="button"
        className="brand-btn-primary w-full sm:w-fit"
        disabled={isPending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const response = await fetch(`/api/admin/orders/${order.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status, paymentStatus, fulfillmentStatus, notes }),
            });
            const body = await response.json();
            setMessage(response.ok ? `Updated order ${body.order?.order_number || order.orderNumber}.` : body.error || "Failed to update order.");
            if (response.ok) {
              window.location.reload();
            }
          });
        }}
      >
        {isPending ? "Saving..." : "Save Order Updates"}
      </button>
      {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
    </div>
  );
}
