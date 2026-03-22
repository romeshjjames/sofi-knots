import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { ContentStudio } from "@/components/admin/content-studio";
import { getBlogPosts, getPages } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminBlogCreatePage() {
  await requireAdminPage(["super_admin", "content_admin", "marketing_admin"]);
  const [pages, posts] = await Promise.all([getPages(), getBlogPosts()]);

  return (
    <AdminShell
      active="blog"
      eyebrow="Blog editor"
      title="Create article"
      description="Create a blog article in a dedicated editorial workspace with cleaner controls."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Blog", href: "/admin/blog" },
        { label: "Create article" },
      ]}
      actions={
        <Link href="/admin/blog" className="brand-btn-outline px-5 py-3">
          Back to blog
        </Link>
      }
    >
      <ContentStudio pages={pages} posts={posts} initialMode="post" standalone />
    </AdminShell>
  );
}
