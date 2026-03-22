import { AdminBadge, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { getSampleReviews } from "@/lib/admin-suite-data";
import { requireAdminPage } from "@/lib/supabase/auth";

function renderStars(count: number) {
  return "★".repeat(count) + "☆".repeat(Math.max(0, 5 - count));
}

export default async function AdminReviewsPage() {
  await requireAdminPage(["super_admin", "marketing_admin"]);
  const reviews = getSampleReviews();

  return (
    <AdminShell
      active="reviews"
      eyebrow="Social proof"
      title="Reviews"
      description="Moderate ratings, approve premium testimonials, and keep product-linked customer feedback clean and conversion-friendly."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Reviews" },
      ]}
      stats={[
        { label: "Total reviews", value: `${reviews.length}`, hint: "Visible feedback entries in the moderation queue." },
        { label: "Pending approval", value: `${reviews.filter((item) => item.status === "pending").length}`, hint: "Reviews waiting for moderation." },
        { label: "Average rating", value: `${(reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)} / 5`, hint: "Current sentiment across recent reviews." },
      ]}
    >
      <AdminPanel title="Moderation queue" description="Review by rating and approval state, then approve, reject, or remove low-quality submissions.">
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-[24px] border border-[#e7eaee] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{review.productName}</p>
                  <h3 className="mt-1 text-lg font-medium text-slate-950">{review.headline}</h3>
                </div>
                <AdminBadge tone={review.status === "approved" ? "success" : review.status === "pending" ? "warning" : "danger"}>
                  {review.status}
                </AdminBadge>
              </div>
              <p className="mt-3 text-sm font-medium tracking-wide text-amber-600">{renderStars(review.rating)}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{review.body}</p>
              <div className="mt-4 text-xs text-slate-500">
                {review.customerName} • {review.submittedAt}
              </div>
              <div className="mt-5 flex gap-2">
                <button type="button" className="rounded-xl bg-[#1f2933] px-3 py-2 text-xs font-medium text-white">Approve</button>
                <button type="button" className="rounded-xl border border-[#e7eaee] px-3 py-2 text-xs font-medium text-slate-700">Reject</button>
                <button type="button" className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700">Delete</button>
              </div>
            </article>
          ))}
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
