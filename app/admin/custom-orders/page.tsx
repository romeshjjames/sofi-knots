import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AdminBadge, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { getSampleCustomOrders } from "@/lib/admin-suite-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminCustomOrdersPage() {
  await requireAdminPage(["super_admin", "order_admin", "marketing_admin"]);
  const requests = getSampleCustomOrders();

  return (
    <AdminShell
      active="customOrders"
      eyebrow="Concierge requests"
      title="Custom Orders"
      description="Handle personalized macrame inquiries with a polished high-touch workflow for quoting, production, and follow-up."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Custom Orders" },
      ]}
      stats={[
        { label: "Open inquiries", value: `${requests.filter((item) => item.status === "new" || item.status === "quoted" || item.status === "in_progress").length}`, hint: "Requests still in motion." },
        { label: "New today", value: `${requests.filter((item) => item.status === "new").length}`, hint: "Fresh leads needing first response." },
        { label: "Won projects", value: `${requests.filter((item) => item.status === "won").length}`, hint: "Closed requests converted to paid work." },
      ]}
    >
      <AdminPanel title="Inquiry queue" description="Client-led custom requests, with budgets, notes, and reference materials ready for quick review.">
        <div className="overflow-hidden rounded-[24px] border border-[#e7eaee]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbfcfd] text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Product type</th>
                <th className="px-5 py-4 font-medium">Budget</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-t border-[#eef1f4] bg-white">
                  <td className="px-5 py-4 align-top">
                    <div className="font-medium text-slate-900">{request.customerName}</div>
                    <div className="mt-1 text-xs text-slate-500">{request.email}</div>
                  </td>
                  <td className="px-5 py-4 align-top text-slate-700">
                    <div>{request.productType}</div>
                    <div className="mt-1 text-xs text-slate-500">{request.requestSummary}</div>
                  </td>
                  <td className="px-5 py-4 align-top font-medium text-slate-900">{request.budget}</td>
                  <td className="px-5 py-4 align-top">
                    <AdminBadge tone={request.status === "new" ? "warning" : request.status === "quoted" ? "info" : request.status === "won" ? "success" : "default"}>
                      {request.status.replace("_", " ")}
                    </AdminBadge>
                  </td>
                  <td className="px-5 py-4 align-top text-slate-600">{request.submittedAt}</td>
                  <td className="px-5 py-4 align-top">
                    <Link href={`/admin/custom-orders/${request.id}`} className="inline-flex items-center gap-1 font-medium text-slate-700 transition hover:text-slate-950">
                      Open
                      <ChevronRight size={15} />
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
