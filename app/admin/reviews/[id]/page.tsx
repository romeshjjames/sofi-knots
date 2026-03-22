import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ReviewEditor } from "@/components/admin/review-editor";
import { getReviewById, getReviewSupportData } from "@/lib/reviews";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminReviewDetailPage({ params }: { params: { id: string } }) {
  await requireAdminPage(["super_admin", "marketing_admin"]);
  const [review, support] = await Promise.all([getReviewById(params.id), getReviewSupportData()]);

  if (!review) notFound();

  return (
    <AdminShell
      active="reviews"
      eyebrow="Review detail"
      title={review.title || review.customerName}
      description="Review customer feedback, adjust moderation status, link the product, and decide whether the review should be featured on premium trust surfaces."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Reviews", href: "/admin/reviews" },
        { label: review.customerName },
      ]}
      actions={
        <Link href="/admin/reviews" className="brand-btn-outline px-5 py-3">
          Back to reviews
        </Link>
      }
      statsVariant="compact"
      stats={[
        { label: "Rating", value: `${review.rating}/5`, hint: "Customer star rating on this review." },
        { label: "Status", value: review.status, hint: "Current moderation state." },
        { label: "Featured", value: review.featuredReview ? "Yes" : "No", hint: "Whether the review is highlighted." },
        { label: "Date", value: new Date(review.reviewDate).toLocaleDateString("en-IN"), hint: "Customer review date." },
      ]}
    >
      <ReviewEditor review={review} mode="edit" products={support.products} />
    </AdminShell>
  );
}
