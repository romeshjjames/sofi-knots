"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Save, Trash2 } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { CustomOrderDetail, CustomOrderStatus } from "@/types/custom-orders";

type CustomOrderEditorProps = {
  customOrder?: CustomOrderDetail | null;
  mode: "create" | "edit";
};

const statusOptions: { value: CustomOrderStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "under_review", label: "Under review" },
  { value: "contacted", label: "Contacted" },
  { value: "awaiting_customer_response", label: "Awaiting customer response" },
  { value: "quoted", label: "Quoted" },
  { value: "awaiting_approval", label: "Awaiting approval" },
  { value: "approved", label: "Approved" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "delivered", label: "Delivered" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

function emptyCustomOrder(): CustomOrderDetail {
  return {
    id: `custom_order_${Date.now()}`,
    customerName: "",
    email: "",
    phone: "",
    productType: "",
    requestSummary: "",
    budget: "",
    status: "new",
    submittedAt: new Date().toISOString().slice(0, 10),
    estimatedPrice: "",
    assignedTeamMember: "",
    expectedCompletionDate: null,
    updatedAt: null,
    customizationDetails: "",
    preferredColors: "",
    preferredMaterials: "",
    quantity: null,
    referenceNotes: "",
    referenceImages: [],
    timelineNotes: "",
    internalNotes: "",
    productionTimeline: "",
    shippingEstimate: "",
    specialConditions: "",
    confirmedPrice: "",
    paymentStatus: "",
    trackingDetails: "",
    completionNotes: "",
    dispatchNotes: "",
    finalPaymentNotes: "",
    cancellationReason: "",
  };
}

function statusTone(status: CustomOrderStatus) {
  if (status === "completed" || status === "delivered" || status === "approved") return "success";
  if (status === "rejected" || status === "cancelled") return "danger";
  if (status === "quoted" || status === "awaiting_approval" || status === "contacted") return "info";
  return "warning";
}

export function CustomOrderEditor({ customOrder, mode }: CustomOrderEditorProps) {
  const [editor, setEditor] = useState<CustomOrderDetail>(customOrder ?? emptyCustomOrder());
  const [referenceImages, setReferenceImages] = useState((customOrder?.referenceImages ?? []).join(", "));
  const [message, setMessage] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof CustomOrderDetail>(field: K, value: CustomOrderDetail[K]) {
    setEditor((current) => ({ ...current, [field]: value }));
  }

  function saveCustomOrder() {
    setMessage(null);
    startTransition(async () => {
      const payload: CustomOrderDetail = {
        ...editor,
        referenceImages: referenceImages.split(",").map((value) => value.trim()).filter(Boolean),
      };

      const response = await fetch(mode === "create" ? "/api/admin/custom-orders" : `/api/admin/custom-orders/${editor.id}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Failed to save custom order.");
        return;
      }

      if (mode === "create") {
        window.location.href = `/admin/custom-orders/${payload.id}`;
        return;
      }

      setMessage("Custom order saved successfully.");
      window.location.reload();
    });
  }

  function deleteCustomOrder() {
    if (mode !== "edit") return;
    startTransition(async () => {
      const response = await fetch(`/api/admin/custom-orders/${editor.id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Failed to delete custom order.");
        return;
      }
      window.location.href = "/admin/custom-orders";
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{mode === "create" ? "Add custom order" : "Edit custom order"}</div>
              <h2 className="mt-2 font-serif text-2xl text-slate-950">{editor.productType || "New custom order"}</h2>
            </div>
            <AdminBadge tone={statusTone(editor.status)}>{editor.status.replace(/_/g, " ")}</AdminBadge>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Customer and request</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input className="brand-input" placeholder="Customer name" value={editor.customerName} onChange={(event) => updateField("customerName", event.target.value)} />
            <input className="brand-input" placeholder="Email" value={editor.email} onChange={(event) => updateField("email", event.target.value)} />
            <input className="brand-input" placeholder="Phone" value={editor.phone} onChange={(event) => updateField("phone", event.target.value)} />
            <input className="brand-input" placeholder="Requested product type" value={editor.productType} onChange={(event) => updateField("productType", event.target.value)} />
            <input className="brand-input" type="date" value={editor.submittedAt} onChange={(event) => updateField("submittedAt", event.target.value)} />
            <select className="brand-input" value={editor.status} onChange={(event) => updateField("status", event.target.value as CustomOrderStatus)}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input className="brand-input" placeholder="Budget" value={editor.budget} onChange={(event) => updateField("budget", event.target.value)} />
            <input className="brand-input" type="number" min="1" placeholder="Quantity" value={editor.quantity ?? ""} onChange={(event) => updateField("quantity", event.target.value ? Number(event.target.value) : null)} />
            <textarea className="brand-input min-h-28 md:col-span-2" placeholder="Request summary" value={editor.requestSummary} onChange={(event) => updateField("requestSummary", event.target.value)} />
            <textarea className="brand-input min-h-28 md:col-span-2" placeholder="Customization details" value={editor.customizationDetails} onChange={(event) => updateField("customizationDetails", event.target.value)} />
            <input className="brand-input" placeholder="Preferred colors" value={editor.preferredColors} onChange={(event) => updateField("preferredColors", event.target.value)} />
            <input className="brand-input" placeholder="Preferred materials" value={editor.preferredMaterials} onChange={(event) => updateField("preferredMaterials", event.target.value)} />
            <textarea className="brand-input min-h-24 md:col-span-2" placeholder="Reference notes" value={editor.referenceNotes} onChange={(event) => updateField("referenceNotes", event.target.value)} />
            <input className="brand-input md:col-span-2" placeholder="Reference images (comma separated)" value={referenceImages} onChange={(event) => setReferenceImages(event.target.value)} />
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Qualification and quote</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input className="brand-input" placeholder="Assigned team member" value={editor.assignedTeamMember} onChange={(event) => updateField("assignedTeamMember", event.target.value)} />
            <input className="brand-input" placeholder="Estimated price" value={editor.estimatedPrice} onChange={(event) => updateField("estimatedPrice", event.target.value)} />
            <input className="brand-input" placeholder="Confirmed price" value={editor.confirmedPrice} onChange={(event) => updateField("confirmedPrice", event.target.value)} />
            <input className="brand-input" type="date" value={editor.expectedCompletionDate ?? ""} onChange={(event) => updateField("expectedCompletionDate", event.target.value || null)} />
            <input className="brand-input" placeholder="Production timeline" value={editor.productionTimeline} onChange={(event) => updateField("productionTimeline", event.target.value)} />
            <input className="brand-input" placeholder="Shipping estimate" value={editor.shippingEstimate} onChange={(event) => updateField("shippingEstimate", event.target.value)} />
            <textarea className="brand-input min-h-24 md:col-span-2" placeholder="Timeline notes" value={editor.timelineNotes} onChange={(event) => updateField("timelineNotes", event.target.value)} />
            <textarea className="brand-input min-h-24 md:col-span-2" placeholder="Special conditions" value={editor.specialConditions} onChange={(event) => updateField("specialConditions", event.target.value)} />
            <textarea className="brand-input min-h-24 md:col-span-2" placeholder="Internal notes" value={editor.internalNotes} onChange={(event) => updateField("internalNotes", event.target.value)} />
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <div className="flex flex-wrap gap-3">
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-[#1f2933] px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800" disabled={isPending} onClick={saveCustomOrder}>
              <Save size={15} />
              {isPending ? "Saving..." : "Save custom order"}
            </button>
            <Link href="/admin/custom-orders" className="inline-flex items-center rounded-2xl border border-[#d8dde3] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Cancel
            </Link>
            {mode === "edit" ? (
              <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-5 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={15} />
                Delete custom order
              </button>
            ) : null}
          </div>
          {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Production and closing</h3>
          <div className="mt-4 grid gap-4">
            <input className="brand-input" placeholder="Payment status" value={editor.paymentStatus} onChange={(event) => updateField("paymentStatus", event.target.value)} />
            <input className="brand-input" placeholder="Tracking details" value={editor.trackingDetails} onChange={(event) => updateField("trackingDetails", event.target.value)} />
            <textarea className="brand-input min-h-24" placeholder="Completion notes" value={editor.completionNotes} onChange={(event) => updateField("completionNotes", event.target.value)} />
            <textarea className="brand-input min-h-24" placeholder="Dispatch notes" value={editor.dispatchNotes} onChange={(event) => updateField("dispatchNotes", event.target.value)} />
            <textarea className="brand-input min-h-24" placeholder="Final payment notes" value={editor.finalPaymentNotes} onChange={(event) => updateField("finalPaymentNotes", event.target.value)} />
            <textarea className="brand-input min-h-24" placeholder="Cancellation / rejection reason" value={editor.cancellationReason} onChange={(event) => updateField("cancellationReason", event.target.value)} />
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Workflow guidance</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">Use <strong>Under review</strong> while checking feasibility, materials, and budget fit.</div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">Move to <strong>Quoted</strong> or <strong>Awaiting approval</strong> once pricing and timeline are shared.</div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">Use <strong>In progress</strong>, <strong>Completed</strong>, and <strong>Delivered</strong> for the production lifecycle.</div>
          </div>
        </section>
      </div>

      {deleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Delete custom order?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">This removes the request from the custom-orders workspace.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setDeleteOpen(false)}>
                Cancel
              </button>
              <button type="button" className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700" onClick={deleteCustomOrder}>
                Delete custom order
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
