import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { BlogManager } from "@/components/admin/blog-manager";
import { getBlogPosts } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminBlogPage() {
  await requireAdminPage(["super_admin", "content_admin", "marketing_admin"]);
  const posts = await getBlogPosts();

  return (
    <AdminShell
      active="blog"
      eyebrow="Editorial publishing"
      title="Blog"
      description="Manage editorial stories, guides, launches, and announcements separately from static pages."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Blog" },
      ]}
      statsVariant="compact"
      stats={[
        { label: "Articles", value: `${posts.length}`, hint: "Posts currently in the editorial library." },
        { label: "Published", value: `${posts.filter((post) => post.adminStatus === "published").length}`, hint: "Posts currently live on the website." },
        { label: "Scheduled", value: `${posts.filter((post) => post.adminStatus === "scheduled").length}`, hint: "Posts queued for future publishing." },
        { label: "Featured", value: `${posts.filter((post) => post.featuredArticle).length}`, hint: "Posts marked as featured editorial content." },
      ]}
    >
      <AdminPanel title="Blog library" description="Search, filter, open, and manage blog articles without mixing them into page management.">
        <BlogManager posts={posts} />
      </AdminPanel>
    </AdminShell>
  );
}
