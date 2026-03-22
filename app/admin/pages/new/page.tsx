import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { ContentStudio } from "@/components/admin/content-studio";
import { getBlogPosts, getPages } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminPageCreatePage() {
  await requireAdminPage(["super_admin", "content_admin", "marketing_admin"]);
  const [pages, posts] = await Promise.all([getPages(), getBlogPosts()]);

  return (
    <AdminShell
      active="pages"
      eyebrow="Page editor"
      title="Create page"
      description="Create a page in a dedicated workspace without crowding the page list."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Pages", href: "/admin/pages" },
        { label: "Create page" },
      ]}
      actions={
        <Link href="/admin/pages" className="brand-btn-outline px-5 py-3">
          Back to pages
        </Link>
      }
    >
      <ContentStudio pages={pages} posts={posts} initialMode="page" standalone />
    </AdminShell>
  );
}
