import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { ReviewManager } from "@/components/admin/review-manager";
import { getReviews } from "@/lib/reviews";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminReviewsPage() {
  await requireAdminPage(["super_admin", "marketing_admin"]);
  const reviews = await getReviews();
  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

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
      statsVariant="compact"
      stats={[
        { label: "Total reviews", value: `${reviews.length}`, hint: "Visible feedback entries in the moderation queue." },
        { label: "Pending", value: `${reviews.filter((item) => item.status === "pending").length}`, hint: "Reviews waiting for moderation." },
        { label: "Approved", value: `${reviews.filter((item) => item.status === "approved").length}`, hint: "Reviews eligible for storefront display." },
        { label: "Featured", value: `${reviews.filter((item) => item.featuredReview).length}`, hint: "Premium testimonials highlighted in the brand experience." },
        { label: "Average rating", value: `${averageRating}/5`, hint: "Current sentiment across visible review records." },
      ]}
    >
      <AdminPanel title="Review library" description="Search, filter, moderate, feature, and open review records from one cleaner Shopify-style moderation workspace.">
        <ReviewManager reviews={reviews} />
      </AdminPanel>
    </AdminShell>
  );
}
