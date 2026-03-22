"use client";

import { useState, useTransition } from "react";
import { Archive, Ban, RotateCcw, Save, Trash2, Truck } from "lucide-react";
import type { OrderDetail } from "@/types/orders";

type OrderStatusFormProps = {
  order: OrderDetail;
};

type ConfirmAction = "cancel" | "refund" | "archive" | "delete" | null;

const fulfillmentOptions = [
  { value: "unfulfilled", label: "Unfulfilled" },
  { value: "processing", label: "Processing" },
  { value: "ready_to_ship", label: "Ready to ship" },
  { value: "partially_fulfilled", label: "Partially fulfilled" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
];

const paymentOptions = [
  { value: "pending", label: "Pending" },
  { value: "authorized", label: "Authorized" },
  { value: "paid", label: "Paid" },
  { value: "partially_paid", label: "Partially paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
  { value: "partially_refunded", label: "Partially refunded" },
];

export function OrderStatusForm({ order }: OrderStatusFormProps) {
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [fulfillmentStatus, setFulfillmentStatus] = useState(order.fulfillmentStatus);
  const [customerName, setCustomerName] = useState(order.customerName);
  const [customerEmail, setCustomerEmail] = useState(order.customerEmail);
  const [customerPhone, setCustomerPhone] = useState(order.customerPhone || "");
  const [notes, setNotes] = useState(order.notes || "");
  const [internalComments, setInternalComments] = useState(order.internalComments || "");
  const [customItemNotes, setCustomItemNotes] = useState(order.customItemNotes || "");
  const [tags, setTags] = useState((order.tags ?? []).join(", "));
  const [shippingPartner, setShippingPartner] = useState(order.shippingPartner || "");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [shippingMethod, setShippingMethod] = useState(order.shippingMethod || "");
  const [estimatedDelivery, setEstimatedDelivery] = useState(order.estimatedDelivery || "");
  const [cancellationReason, setCancellationReason] = useState(order.cancellationReason || "");
  const [refundReason, setRefundReason] = useState(order.refundReason || "");
  const [refundAmountInr, setRefundAmountInr] = useState(order.refundAmountInr?.toString() || "");
  const [refundShipping, setRefundShipping] = useState(order.refundShipping === true);
  const [restockItems, setRestockItems] = useState(order.restockItems !== false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [isPending, startTransition] = useTransition();

  const [shippingAddress, setShippingAddress] = useState<Record<string, string>>({
    name: order.shippingAddress?.name || "",
    line1: order.shippingAddress?.line1 || "",
    city: order.shippingAddress?.city || "",
    state: order.shippingAddress?.state || "",
    postal_code: order.shippingAddress?.postal_code || "",
    country: order.shippingAddress?.country || "",
    phone: order.shippingAddress?.phone || "",
  });

  const [billingAddress, setBillingAddress] = useState<Record<string, string>>({
    name: order.billingAddress?.name || "",
    line1: order.billingAddress?.line1 || "",
    city: order.billingAddress?.city || "",
    state: order.billingAddress?.state || "",
    postal_code: order.billingAddress?.postal_code || "",
    country: order.billingAddress?.country || "",
    phone: order.billingAddress?.phone || "",
  });

  function buildPayload(overrides?: Record<string, unknown>) {
    return {
      status,
      paymentStatus,
      fulfillmentStatus,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      internalComments,
      customItemNotes,
      tags: tags.split(",").map((value) => value.trim()).filter(Boolean),
      shippingPartner,
      trackingNumber,
      shippingMethod,
      estimatedDelivery,
      cancellationReason,
      refundReason,
      refundAmountInr: refundAmountInr ? Number(refundAmountInr) : null,
      refundShipping,
      restockItems,
      shippingAddress,
      billingAddress,
      ...overrides,
    };
  }

  function saveOrder(overrides?: Record<string, unknown>) {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(overrides)),
      });
      const body = await response.json();
      setMessage(response.ok ? `Updated order ${body.order?.order_number || order.orderNumber}.` : body.error || "Failed to update order.");
      if (response.ok) {
        window.location.reload();
      }
    });
  }

  function removeOrder(mode: "archive" | "delete") {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/admin/orders/${order.id}?mode=${mode}`, {
        method: "DELETE",
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Failed to remove order.");
        return;
      }
      window.location.href = "/admin/orders";
    });
  }

  function renderAddressCard(
    title: string,
    value: Record<string, string>,
    onChange: (next: Record<string, string>) => void,
  ) {
    return (
      <div className="rounded-3xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input className="brand-input" value={value.name || ""} placeholder="Name" onChange={(event) => onChange({ ...value, name: event.target.value })} />
          <input className="brand-input" value={value.phone || ""} placeholder="Phone" onChange={(event) => onChange({ ...value, phone: event.target.value })} />
          <input className="brand-input md:col-span-2" value={value.line1 || ""} placeholder="Address line" onChange={(event) => onChange({ ...value, line1: event.target.value })} />
          <input className="brand-input" value={value.city || ""} placeholder="City" onChange={(event) => onChange({ ...value, city: event.target.value })} />
          <input className="brand-input" value={value.state || ""} placeholder="State" onChange={(event) => onChange({ ...value, state: event.target.value })} />
          <input className="brand-input" value={value.postal_code || ""} placeholder="Postal code" onChange={(event) => onChange({ ...value, postal_code: event.target.value })} />
          <input className="brand-input" value={value.country || ""} placeholder="Country" onChange={(event) => onChange({ ...value, country: event.target.value })} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 rounded-[28px] border border-[#e7eaee] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-slate-950">Order workflow</h2>
          <p className="text-sm text-slate-600">Review, update, fulfill, cancel, refund, archive, or delete the order from one workflow panel.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-[#d8dde3] px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50" disabled={isPending} onClick={() => saveOrder({ fulfillmentStatus: "ready_to_ship", status: "processing" })}>
            <Truck size={15} />
            Ready to ship
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-[#d8dde3] px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50" disabled={isPending} onClick={() => saveOrder({ fulfillmentStatus: "fulfilled", status: "fulfilled" })}>
            Fulfill
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-[#ead6b4] px-4 py-2.5 text-sm font-medium text-[#8a6526] transition hover:bg-[#fff7ea]" disabled={isPending} onClick={() => setConfirmAction("refund")}>
            <RotateCcw size={15} />
            Refund
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50" disabled={isPending} onClick={() => setConfirmAction("cancel")}>
            <Ban size={15} />
            Cancel order
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <select className="brand-input" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <select className="brand-input" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
          {paymentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select className="brand-input" value={fulfillmentStatus} onChange={(event) => setFulfillmentStatus(event.target.value)}>
          {fulfillmentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-3xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
            <h3 className="text-sm font-semibold text-slate-900">Customer details</h3>
            <div className="mt-3 grid gap-3">
              <input className="brand-input" value={customerName} placeholder="Customer name" onChange={(event) => setCustomerName(event.target.value)} />
              <input className="brand-input" value={customerEmail} placeholder="Email" onChange={(event) => setCustomerEmail(event.target.value)} />
              <input className="brand-input" value={customerPhone} placeholder="Phone" onChange={(event) => setCustomerPhone(event.target.value)} />
              <input className="brand-input" value={tags} placeholder="Tags, comma separated" onChange={(event) => setTags(event.target.value)} />
            </div>
          </div>

          {renderAddressCard("Shipping address", shippingAddress, setShippingAddress)}
          {renderAddressCard("Billing address", billingAddress, setBillingAddress)}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
            <h3 className="text-sm font-semibold text-slate-900">Fulfillment and shipping</h3>
            <div className="mt-3 grid gap-3">
              <input className="brand-input" value={shippingPartner} placeholder="Courier / shipping partner" onChange={(event) => setShippingPartner(event.target.value)} />
              <input className="brand-input" value={trackingNumber} placeholder="Tracking number" onChange={(event) => setTrackingNumber(event.target.value)} />
              <input className="brand-input" value={shippingMethod} placeholder="Shipping method" onChange={(event) => setShippingMethod(event.target.value)} />
              <input className="brand-input" type="date" value={estimatedDelivery} onChange={(event) => setEstimatedDelivery(event.target.value)} />
            </div>
          </div>

          <div className="rounded-3xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
            <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
            <div className="mt-3 grid gap-3">
              <textarea className="brand-input min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Order notes" />
              <textarea className="brand-input min-h-24" value={internalComments} onChange={(event) => setInternalComments(event.target.value)} placeholder="Internal comments" />
              <textarea className="brand-input min-h-24" value={customItemNotes} onChange={(event) => setCustomItemNotes(event.target.value)} placeholder="Custom item notes" />
            </div>
          </div>

          <div className="rounded-3xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
            <h3 className="text-sm font-semibold text-slate-900">Refund and cancellation</h3>
            <div className="mt-3 grid gap-3">
              <input className="brand-input" value={cancellationReason} placeholder="Cancellation reason" onChange={(event) => setCancellationReason(event.target.value)} />
              <input className="brand-input" value={refundReason} placeholder="Refund reason" onChange={(event) => setRefundReason(event.target.value)} />
              <input className="brand-input" type="number" min="0" value={refundAmountInr} placeholder="Refund amount" onChange={(event) => setRefundAmountInr(event.target.value)} />
              <label className="flex items-center justify-between rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700">
                Refund shipping
                <input type="checkbox" checked={refundShipping} onChange={(event) => setRefundShipping(event.target.checked)} />
              </label>
              <label className="flex items-center justify-between rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700">
                Restock items on cancellation/refund
                <input type="checkbox" checked={restockItems} onChange={(event) => setRestockItems(event.target.checked)} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-[#1f2933] px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800" disabled={isPending} onClick={() => saveOrder()}>
          <Save size={15} />
          {isPending ? "Saving..." : "Save updates"}
        </button>
        <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-[#d8dde3] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" disabled={isPending} onClick={() => setConfirmAction("archive")}>
          <Archive size={15} />
          Archive order
        </button>
        <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-5 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50" disabled={isPending} onClick={() => setConfirmAction("delete")}>
          <Trash2 size={15} />
          Delete order
        </button>
      </div>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}

      {confirmAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">
              {confirmAction === "cancel" && "Cancel order?"}
              {confirmAction === "refund" && "Refund order?"}
              {confirmAction === "archive" && "Archive order?"}
              {confirmAction === "delete" && "Delete order?"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {confirmAction === "cancel" && "This will mark the order as cancelled and keep the order record in the admin for history."}
              {confirmAction === "refund" && "This will update the order as refunded based on the refund details entered in this panel."}
              {confirmAction === "archive" && "This hides the order from the active order queue without removing its history."}
              {confirmAction === "delete" && "This permanently removes the order. For safety, only cancelled or refunded orders can be deleted."}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setConfirmAction(null)}>
                Close
              </button>
              <button
                type="button"
                className="rounded-2xl bg-[#1f2933] px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                onClick={() => {
                  if (confirmAction === "cancel") {
                    saveOrder({ status: "cancelled", fulfillmentStatus: "unfulfilled" });
                  } else if (confirmAction === "refund") {
                    saveOrder({
                      status: "refunded",
                      paymentStatus: refundAmountInr && Number(refundAmountInr) < order.totalInr ? "partially_refunded" : "refunded",
                    });
                  } else if (confirmAction === "archive") {
                    removeOrder("archive");
                  } else if (confirmAction === "delete") {
                    removeOrder("delete");
                  }
                  setConfirmAction(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
