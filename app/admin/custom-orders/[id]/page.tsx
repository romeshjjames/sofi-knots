import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBadge, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { getSampleCustomOrderById } from "@/lib/admin-suite-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminCustomOrderDetailPage({ params }: { params: { id: string } }) {
  await requireAdminPage(["super_admin", "order_admin", "marketing_admin"]);
  const request = getSampleCustomOrderById(params.id);
  if (!request) notFound();

  return (
    <AdminShell
      active="customOrders"
      eyebrow="Inquiry detail"
      title={request.productType}
      description="Full request details, reference materials, internal notes, and status controls for this bespoke order inquiry."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Custom Orders", href: "/admin/custom-orders" },
        { label: request.customerName },
      ]}
      actions={
        <Link href="/admin/custom-orders" className="brand-btn-outline px-5 py-3">
          Back to inquiries
        </Link>
      }
      stats={[
        { label: "Budget", value: request.budget, hint: "Client budget expectation for this project." },
        { label: "Status", value: request.status.replace("_", " "), hint: "Current stage of the custom-order pipeline." },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <AdminPanel title="Request summary" description="The client brief, project intent, and delivery context.">
            <p className="text-sm leading-7 text-slate-600">{request.requestSummary}</p>
            <div className="mt-5">
              <AdminBadge tone={request.status === "new" ? "warning" : request.status === "quoted" ? "info" : request.status === "won" ? "success" : "default"}>
                {request.status.replace("_", " ")}
              </AdminBadge>
            </div>
          </AdminPanel>
          <AdminPanel title="Reference images" description="Moodboards and source visuals attached to the request.">
            <div className="grid gap-3 sm:grid-cols-2">
              {request.referenceImages.map((item) => (
                <div key={item} className="rounded-2xl border border-dashed border-[#d9dee5] bg-[#fbfcfd] p-5 text-sm text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>
        <div className="space-y-6">
          <AdminPanel title="Contact details" description="Core client information for follow-up.">
            <div className="space-y-2 text-sm text-slate-600">
              <div className="font-medium text-slate-900">{request.customerName}</div>
              <div>{request.email}</div>
              <div>Submitted on {request.submittedAt}</div>
            </div>
          </AdminPanel>
          <AdminPanel title="Internal notes" description="Team-only context, quote progress, and next action.">
            <p className="text-sm leading-6 text-slate-600">{request.notes}</p>
          </AdminPanel>
        </div>
      </div>
    </AdminShell>
  );
}
