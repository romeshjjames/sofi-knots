"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Save, Trash2, X } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { CustomerAddress, CustomerDetail } from "@/types/customers";

type CustomerEditorProps = {
  customer?: CustomerDetail | null;
  mode: "create" | "edit";
};

function emptyAddress(label = "Shipping"): CustomerAddress {
  return { label, value: ["", "", "", ""] };
}

export function CustomerEditor({ customer, mode }: CustomerEditorProps) {
  const [firstName, setFirstName] = useState(customer?.firstName || "");
  const [lastName, setLastName] = useState(customer?.lastName || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [notes, setNotes] = useState(customer?.notes || "");
  const [tags, setTags] = useState((customer?.tags || []).join(", "));
  const [addresses, setAddresses] = useState<CustomerAddress[]>(customer?.addresses?.length ? customer.addresses : [emptyAddress()]);
  const [message, setMessage] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function saveCustomer() {
    setMessage(null);
    startTransition(async () => {
      const payload = {
        firstName,
        lastName,
        email,
        phone,
        notes,
        tags: tags.split(",").map((value) => value.trim()).filter(Boolean),
        addresses: addresses
          .map((address) => ({
            label: address.label,
            value: address.value.map((line) => line.trim()).filter(Boolean),
          }))
          .filter((address) => address.label || address.value.length),
      };

      const response = await fetch(mode === "create" ? "/api/admin/customers" : `/api/admin/customers/${customer?.id}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Failed to save customer.");
        return;
      }

      if (mode === "create" && body.customerId) {
        window.location.href = `/admin/customers/${body.customerId}`;
        return;
      }

      setMessage("Customer saved successfully.");
      window.location.reload();
    });
  }

  function deleteCustomer() {
    if (!customer?.id) return;
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "DELETE",
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Failed to delete customer.");
        return;
      }
      window.location.href = "/admin/customers";
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{mode === "create" ? "Add customer" : "Edit customer"}</div>
              <h2 className="mt-2 font-serif text-2xl text-slate-950">{firstName || lastName ? `${firstName} ${lastName}`.trim() : "New customer"}</h2>
            </div>
            {customer?.tags?.includes("VIP") ? <AdminBadge tone="success">VIP</AdminBadge> : null}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Customer details</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input className="brand-input" placeholder="First name" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            <input className="brand-input" placeholder="Last name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
            <input className="brand-input md:col-span-2" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <input className="brand-input md:col-span-2" placeholder="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            <input className="brand-input md:col-span-2" placeholder="Tags (VIP, Repeat customer, Wholesale)" value={tags} onChange={(event) => setTags(event.target.value)} />
            <textarea className="brand-input min-h-28 md:col-span-2" placeholder="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-950">Saved addresses</h3>
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-[#d8dde3] px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setAddresses((current) => [...current, emptyAddress(`Address ${current.length + 1}`)])}>
              <Plus size={15} />
              Add address
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {addresses.map((address, index) => (
              <div key={`${address.label}-${index}`} className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
                <div className="flex items-center justify-between gap-3">
                  <input className="brand-input max-w-[200px]" value={address.label} onChange={(event) => setAddresses((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, label: event.target.value } : entry))} />
                  <button type="button" className="rounded-xl p-2 text-slate-400 hover:bg-white" onClick={() => setAddresses((current) => current.filter((_, entryIndex) => entryIndex !== index))}>
                    <X size={15} />
                  </button>
                </div>
                <div className="mt-3 grid gap-3">
                  {address.value.map((line, lineIndex) => (
                    <input
                      key={`${index}-${lineIndex}`}
                      className="brand-input"
                      placeholder={`Address line ${lineIndex + 1}`}
                      value={line}
                      onChange={(event) =>
                        setAddresses((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === index
                              ? {
                                  ...entry,
                                  value: entry.value.map((entryLine, entryLineIndex) => (entryLineIndex === lineIndex ? event.target.value : entryLine)),
                                }
                              : entry,
                          ),
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <div className="flex flex-wrap gap-3">
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-[#1f2933] px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800" disabled={isPending} onClick={saveCustomer}>
              <Save size={15} />
              {isPending ? "Saving..." : "Save customer"}
            </button>
            <Link href="/admin/customers" className="inline-flex items-center rounded-2xl border border-[#d8dde3] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Cancel
            </Link>
            {mode === "edit" ? (
              <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-5 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={15} />
                Delete customer
              </button>
            ) : null}
          </div>
          {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
        </section>
      </div>

      <div className="space-y-6">
        {mode === "edit" && customer ? (
          <>
            <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
              <h3 className="text-lg font-semibold text-slate-950">Order history</h3>
              <div className="mt-4 space-y-3">
                {customer.orderHistory.length ? customer.orderHistory.map((order) => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`} className="block rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 transition hover:bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-900">{order.orderNumber}</div>
                        <div className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString("en-IN")} • {order.fulfillmentStatus}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-slate-900">Rs. {order.totalInr.toLocaleString("en-IN")}</div>
                        <div className="mt-1 text-xs text-slate-500">{order.paymentStatus}</div>
                      </div>
                    </div>
                  </Link>
                )) : <div className="rounded-2xl border border-dashed border-[#d9dee5] bg-[#fbfcfd] p-4 text-sm text-slate-500">No orders yet.</div>}
              </div>
            </section>

            <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
              <h3 className="text-lg font-semibold text-slate-950">Customer timeline</h3>
              <div className="mt-4 space-y-3">
                {customer.timeline.length ? customer.timeline.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3">
                    <div className="font-medium text-slate-900">{entry.action}</div>
                    <div className="mt-1 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString("en-IN")}</div>
                  </div>
                )) : <div className="rounded-2xl border border-dashed border-[#d9dee5] bg-[#fbfcfd] p-4 text-sm text-slate-500">No timeline events yet.</div>}
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
            <h3 className="text-lg font-semibold text-slate-950">What happens next</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-[#fbfcfd] p-4">Save the customer to add them to the customer list.</div>
              <div className="rounded-2xl bg-[#fbfcfd] p-4">After saving, future orders and CRM updates can be tracked against this profile.</div>
              <div className="rounded-2xl bg-[#fbfcfd] p-4">Use tags like VIP, Repeat customer, Wholesale, or Premium buyer for segmentation.</div>
            </div>
          </section>
        )}
      </div>

      {deleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Delete customer?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">This removes the customer record. Historical orders may remain for reporting depending on system rules.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setDeleteOpen(false)}>
                Cancel
              </button>
              <button type="button" className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700" onClick={deleteCustomer}>
                Delete customer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
