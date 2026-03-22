import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ContentStudio } from "@/components/admin/content-studio";
import { getBlogPosts, getPages } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminBlogDetailPage({ params }: { params: { id: string } }) {
  await requireAdminPage(["super_admin", "content_admin", "marketing_admin"]);
  const [pages, posts] = await Promise.all([getPages(), getBlogPosts()]);
  const post = posts.find((item) => item.id === params.id);
  if (!post) notFound();

  return (
    <AdminShell
      active="blog"
      eyebrow="Blog editor"
      title={post.title}
      description="Edit blog type, category, tags, schedule, feature settings, SEO, and content body from a dedicated article editor."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Blog", href: "/admin/blog" },
        { label: post.title },
      ]}
      actions={
        <Link href="/admin/blog" className="brand-btn-outline px-5 py-3">
          Back to blog
        </Link>
      }
    >
      <ContentStudio pages={pages} posts={posts} initialMode="post" initialRecordId={params.id} standalone />
    </AdminShell>
  );
}
