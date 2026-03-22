import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { ReviewEditor } from "@/components/admin/review-editor";
import { getReviewSupportData } from "@/lib/reviews";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminReviewCreatePage() {
  await requireAdminPage(["super_admin", "marketing_admin"]);
  const support = await getReviewSupportData();

  return (
    <AdminShell
      active="reviews"
      eyebrow="Review detail"
      title="Add review"
      description="Create a review manually, link it to a product, set its moderation status, and choose whether it should be featured."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Reviews", href: "/admin/reviews" },
        { label: "Add review" },
      ]}
      actions={
        <Link href="/admin/reviews" className="brand-btn-outline px-5 py-3">
          Back to reviews
        </Link>
      }
    >
      <ReviewEditor mode="create" products={support.products} />
    </AdminShell>
  );
}
