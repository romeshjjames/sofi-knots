import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ContentStudio } from "@/components/admin/content-studio";
import { getBlogPosts, getPages } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminPageDetailPage({ params }: { params: { id: string } }) {
  await requireAdminPage(["super_admin", "content_admin", "marketing_admin"]);
  const [pages, posts] = await Promise.all([getPages(), getBlogPosts()]);
  const page = pages.find((item) => item.id === params.id);
  if (!page) notFound();

  return (
    <AdminShell
      active="pages"
      eyebrow="Page editor"
      title={page.title}
      description="Edit page content, SEO, and publishing settings from a dedicated page editor."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Pages", href: "/admin/pages" },
        { label: page.title },
      ]}
      actions={
        <Link href="/admin/pages" className="brand-btn-outline px-5 py-3">
          Back to pages
        </Link>
      }
    >
      <ContentStudio pages={pages} posts={posts} initialMode="page" initialRecordId={params.id} standalone />
    </AdminShell>
  );
}
